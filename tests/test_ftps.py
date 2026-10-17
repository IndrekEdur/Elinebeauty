import contextlib
import ftplib
import hashlib
import io
import os
from pathlib import Path
import ssl
import tempfile
import unittest
from unittest.mock import Mock, patch

from scripts import ftps


def settings(**overrides):
    return {
        "ZONE_FTP_HOST": "ftp.example.test", "ZONE_FTP_PORT": "21",
        "ZONE_FTP_USERNAME": "test-user", "ZONE_FTP_PASSWORD": "unit-test-only",
        "ZONE_FTP_TARGET_PATH": "/htdocs/", "ZONE_CONFIRMED_FTP_TARGET_PATH": "/htdocs/",
        "ZONE_DEPLOY_ENABLED": "true", "ZONE_FTP_PROBE_APPROVED": "true", **overrides,
    }


class FakeFTP:
    def __init__(self):
        self.current = "/"
        self.commands = []
        self.index = b"old index"
        self.dirs = {"/", "/htdocs"}

    def pwd(self):
        self.commands.append(("PWD",))
        return self.current

    def cwd(self, path):
        target = path.rstrip("/") if path.startswith("/") else self.current.rstrip("/") + "/" + path
        target = target or "/"
        self.commands.append(("CWD", target))
        if target not in self.dirs:
            raise ftplib.error_perm("550 Missing directory")
        self.current = target

    def mlsd(self, facts):
        self.commands.append(("MLSD",))
        return iter([("htdocs", {"type": "dir"})] if self.current == "/" else [("index.html", {"type": "file", "size": "9"})])

    def retrbinary(self, command, callback):
        self.commands.append(("RETR", command))
        callback(self.index)

    def mkd(self, path):
        self.commands.append(("MKD", path))
        self.dirs.add(self.current + "/" + path)

    def storbinary(self, command, handle):
        self.commands.append(("STOR", command, handle.read()))


class ConfigTests(unittest.TestCase):
    def test_confirmed_target_and_alias(self):
        config = ftps.validate_config(settings(ZONE_FTP_USERNAME="alias.example.ee"), "deploy")
        self.assertEqual(config["target"], "/htdocs")
        self.assertEqual(config["port"], 21)

    def test_missing_configuration_before_connection(self):
        with patch.dict(os.environ, {}, clear=True), patch.object(ftps, "connect") as connect, contextlib.redirect_stderr(io.StringIO()) as output:
            self.assertEqual(ftps.main(["deploy"]), 1)
        connect.assert_not_called()
        self.assertIn("ZONE_FTP_PASSWORD", output.getvalue())

    def test_deployment_lock(self):
        for value in ("", "false", "TRUE"):
            with self.subTest(value=value), self.assertRaisesRegex(ftps.ConfigError, "lukus"):
                ftps.validate_config(settings(ZONE_DEPLOY_ENABLED=value), "deploy")

    def test_probe_requires_explicit_approval(self):
        with self.assertRaisesRegex(ftps.ConfigError, "kinnitust"):
            ftps.validate_config(settings(ZONE_FTP_PROBE_APPROVED="false"), "probe")

    def test_probe_works_without_target_and_with_deploy_locked(self):
        env = settings(ZONE_DEPLOY_ENABLED="false")
        del env["ZONE_FTP_TARGET_PATH"], env["ZONE_CONFIRMED_FTP_TARGET_PATH"]
        self.assertNotIn("target", ftps.validate_config(env, "probe"))

    def test_target_requires_exact_independent_confirmation(self):
        with self.assertRaisesRegex(ftps.ConfigError, "ei vasta"):
            ftps.validate_config(settings(ZONE_CONFIRMED_FTP_TARGET_PATH="/other"), "deploy")

    def test_rejects_unsafe_paths(self):
        for path in ("/", "htdocs", "/htdocs/../other", "/htdocs/./x", "/htdocs//x", "/htdocs\nDELE x", "/htdocs x"):
            with self.subTest(path=path), self.assertRaises(ftps.ConfigError):
                ftps.safe_path(path)

    def test_rejects_bad_connection_fields_and_line_injection(self):
        for key, value in (("ZONE_FTP_HOST", "https://example.test"), ("ZONE_FTP_PORT", "0"), ("ZONE_FTP_PORT", "65536"), ("ZONE_FTP_USERNAME", "user\r\nPASS x"), ("ZONE_FTP_PASSWORD", "x\nDELE y")):
            with self.subTest(key=key), self.assertRaises(ftps.ConfigError):
                ftps.validate_config(settings(**{key: value}), "deploy")

    def test_password_whitespace_preserved(self):
        self.assertEqual(ftps.validate_config(settings(ZONE_FTP_PASSWORD=" test "), "probe")["password"], " test ")


class TLSTests(unittest.TestCase):
    def test_verified_tls_before_credentials_and_protected_data(self):
        client = Mock()
        with patch.object(ftps, "VerifiedFTPS", return_value=client) as constructor:
            ftps.connect(ftps.validate_config(settings(), "deploy"))
        context = constructor.call_args.kwargs["context"]
        self.assertTrue(context.check_hostname)
        self.assertEqual(context.verify_mode, ssl.CERT_REQUIRED)
        self.assertGreaterEqual(context.minimum_version, ssl.TLSVersion.TLSv1_2)
        self.assertEqual([call[0] for call in client.mock_calls], ["connect", "auth", "login", "prot_p", "set_pasv"])
        self.assertTrue(client.login.call_args.kwargs["secure"])

    def test_failed_certificate_never_sends_password_or_falls_back(self):
        client = Mock()
        client.auth.side_effect = ssl.SSLCertVerificationError("test mismatch")
        with patch.object(ftps, "VerifiedFTPS", return_value=client), self.assertRaises(ssl.SSLCertVerificationError):
            ftps.connect(ftps.validate_config(settings(), "deploy"))
        client.login.assert_not_called()
        client.close.assert_called_once()

    def test_failed_protection_stops_connection(self):
        client = Mock()
        client.prot_p.side_effect = ftplib.error_perm("test failure")
        with patch.object(ftps, "VerifiedFTPS", return_value=client), self.assertRaises(ftplib.error_perm):
            ftps.connect(ftps.validate_config(settings(), "deploy"))
        client.set_pasv.assert_not_called()
        client.close.assert_called_once()

    def test_data_channel_requires_tls(self):
        client = ftps.VerifiedFTPS(context=ssl.create_default_context())
        with self.assertRaisesRegex(ftps.ConfigError, "TLS"):
            client.ntransfercmd("MLSD")

    def test_data_socket_verified_with_same_host_and_session(self):
        context = Mock()
        client = ftps.VerifiedFTPS(context=context)
        client._prot_p = True
        client.sock = Mock(spec=ssl.SSLSocket)
        client.host = "ftp.example.test"
        raw = Mock()
        with patch.object(ftplib.FTP, "ntransfercmd", return_value=(raw, 10)):
            client.ntransfercmd("MLSD")
        context.wrap_socket.assert_called_once_with(raw, server_hostname="ftp.example.test", session=client.sock.session)
        client.sock = None

    def test_probe_protocol_blocks_all_remote_writes_and_plain_data(self):
        client = ftps.ReadOnlyFTPS(context=ssl.create_default_context())
        for command in ("STOR x", "DELE x", "MKD x", "RMD x", "RNFR x", "RNTO x", "APPE x", "SITE CHMOD 777 x", "PROT C"):
            with self.subTest(command=command), self.assertRaises(ftps.ConfigError):
                client.putcmd(command)


class OperationsTests(unittest.TestCase):
    def test_probe_only_lists_and_changes_working_directory(self):
        client = FakeFTP()
        with contextlib.redirect_stdout(io.StringIO()) as output:
            ftps.probe(client)
        self.assertIn("/htdocs", output.getvalue())
        self.assertTrue(all(command[0] in {"PWD", "CWD", "MLSD"} for command in client.commands))

    def test_unexpected_pwd_blocks_writes(self):
        client = Mock()
        client.pwd.return_value = "/other"
        with self.assertRaisesRegex(ftps.ConfigError, "PWD"):
            ftps.enter_target(client, "/htdocs")
        client.storbinary.assert_not_called()

    def test_backup_and_upload_order_without_deletion(self):
        with tempfile.TemporaryDirectory() as temp, contextlib.redirect_stdout(io.StringIO()):
            base = Path(temp)
            root, backup = base / "dist", base / "backup"
            (root / "assets" / "fonts").mkdir(parents=True)
            (root / "index.html").write_text("new html")
            (root / "assets" / "app.js").write_text("new js")
            (root / "assets" / "fonts" / "font.woff2").write_bytes(b"font")
            client = FakeFTP()
            ftps.enter_target(client, "/htdocs")
            ftps.backup_index(client, backup)
            self.assertEqual((backup / "index.html").read_bytes(), b"old index")
            self.assertFalse(any(command[0] in {"STOR", "MKD"} for command in client.commands))
            ftps.upload(client, {"target": "/htdocs"}, root, ftps.build_files(root), backup)
            stores = [command for command in client.commands if command[0] == "STOR"]
            self.assertEqual(stores[-1][1], "STOR index.html")
            self.assertEqual(len(stores), 3)
            self.assertFalse(any(command[0] in {"DELE", "RMD", "RNFR", "RNTO"} for command in client.commands))

    def test_changed_server_index_aborts_before_any_write(self):
        with tempfile.TemporaryDirectory() as temp, contextlib.redirect_stdout(io.StringIO()):
            backup = Path(temp) / "backup"
            client = FakeFTP()
            ftps.backup_index(client, backup)
            client.index = b"changed remotely"
            with self.assertRaisesRegex(ftps.ConfigError, "muutus"):
                ftps.upload(client, {"target": "/htdocs"}, Path(temp), ["index.html"], backup)
            self.assertFalse(any(command[0] in {"STOR", "MKD"} for command in client.commands))

    def test_missing_backup_prevents_connection(self):
        with patch.dict(os.environ, settings(), clear=True), patch.object(ftps, "build_files", return_value=["index.html"]), patch.object(ftps.Path, "is_file", return_value=False), patch.object(ftps, "connect") as connect, contextlib.redirect_stderr(io.StringIO()):
            self.assertEqual(ftps.main(["deploy"]), 1)
        connect.assert_not_called()

    def test_redirected_resource_directory_blocks_nested_creation(self):
        with tempfile.TemporaryDirectory() as temp, contextlib.redirect_stdout(io.StringIO()):
            backup = Path(temp) / "backup"
            client = FakeFTP()
            ftps.backup_index(client, backup)
            client.dirs.add("/htdocs/assets")
            original = client.pwd
            client.pwd = lambda: "/outside" if client.current == "/htdocs/assets" else original()
            with self.assertRaisesRegex(ftps.ConfigError, "ümber suunatud"):
                ftps.upload(client, {"target": "/htdocs"}, Path(temp), ["assets/fonts/font.woff2", "index.html"], backup)
            self.assertFalse(any(command[0] in {"STOR", "MKD"} for command in client.commands))

    def test_raw_server_error_is_not_logged(self):
        with patch.dict(os.environ, settings(), clear=True), patch.object(ftps, "connect", side_effect=ftplib.error_perm("530 unit-test-only")), contextlib.redirect_stderr(io.StringIO()) as output:
            self.assertEqual(ftps.main(["probe"]), 1)
        self.assertNotIn("unit-test-only", output.getvalue())

    def test_json_report_redacts_password_before_escaping(self):
        secret = 'test"only\\value'
        with patch.dict(os.environ, {"ZONE_FTP_PASSWORD": secret}, clear=True), contextlib.redirect_stdout(io.StringIO()) as output:
            ftps.report("Listing", [{"name": secret + "\n::warning::test"}])
        self.assertNotIn("only", output.getvalue())
        self.assertIn("[REDACTED]", output.getvalue())
        self.assertEqual(len(output.getvalue().splitlines()), 1)


if __name__ == "__main__":
    unittest.main()
