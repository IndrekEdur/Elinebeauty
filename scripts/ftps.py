"""Explicit FTPS only. Credentials stay in process memory; no protocol debug logs."""
import argparse
import ftplib
import hashlib
import io
import json
import os
from pathlib import Path
import re
import ssl
import sys


class ConfigError(ValueError):
    pass


def safe_path(value):
    if not re.fullmatch(r"/(?:[A-Za-z0-9_.-]+/)*[A-Za-z0-9_.-]+/?", value):
        raise ConfigError("FTP sihttee peab olema absoluutne, mittetühi ja erinev juurkataloogist /.")
    if any(part in (".", "..") for part in value.split("/")):
        raise ConfigError("FTP sihttee ei tohi sisaldada . ega .. osi.")
    return value.rstrip("/")


def validate_config(env, mode):
    required = ["ZONE_FTP_HOST", "ZONE_FTP_PORT", "ZONE_FTP_USERNAME", "ZONE_FTP_PASSWORD"]
    if mode != "probe":
        required += ["ZONE_FTP_TARGET_PATH", "ZONE_CONFIRMED_FTP_TARGET_PATH"]
    missing = [key for key in required if not env.get(key, "").strip()]
    if missing:
        raise ConfigError("Puuduv FTPS seadistus: " + ", ".join(missing) + ". Serveriga ühendust ei loodud.")
    if mode == "probe":
        if env.get("ZONE_FTP_PROBE_APPROVED") != "true":
            raise ConfigError("Lugemiskontroll nõuab omaniku kinnitust ZONE_FTP_PROBE_APPROVED=true.")
    elif env.get("ZONE_DEPLOY_ENABLED") != "true":
        raise ConfigError("Avaldamine on lukus. ZONE_DEPLOY_ENABLED pole true.")
    host = env["ZONE_FTP_HOST"]
    if not re.fullmatch(r"[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?", host):
        raise ConfigError("ZONE_FTP_HOST peab olema sertifikaadile vastav hostinimi ilma protokolli, pordi ja tühikuteta.")
    port = env["ZONE_FTP_PORT"]
    if not re.fullmatch(r"[1-9][0-9]{0,4}", port) or int(port) > 65535:
        raise ConfigError("ZONE_FTP_PORT peab olema vahemikus 1–65535; explicit FTPS kasutab tavaliselt porti 21.")
    if not re.fullmatch(r"[A-Za-z0-9_][A-Za-z0-9_.@-]*", env["ZONE_FTP_USERNAME"]):
        raise ConfigError("ZONE_FTP_USERNAME vorming ei sobi.")
    if any(c in env["ZONE_FTP_PASSWORD"] for c in ("\r", "\n", "\0")):
        raise ConfigError("ZONE_FTP_PASSWORD ei tohi sisaldada juhtrea eraldajaid.")
    # Never normalize passwords: spaces can be intentional.
    config = dict(host=host, port=int(port), user=env["ZONE_FTP_USERNAME"], password=env["ZONE_FTP_PASSWORD"])
    if mode != "probe":
        if env["ZONE_FTP_TARGET_PATH"] != env["ZONE_CONFIRMED_FTP_TARGET_PATH"]:
            raise ConfigError("ZONE_FTP_TARGET_PATH ei vasta eraldi kinnitatud ZONE_CONFIRMED_FTP_TARGET_PATH väärtusele.")
        config["target"] = safe_path(env["ZONE_FTP_TARGET_PATH"])
    return config


class VerifiedFTPS(ftplib.FTP_TLS):
    """Reuse the authenticated TLS session for servers requiring data session reuse."""
    def ntransfercmd(self, cmd, rest=None):
        if not self._prot_p or not isinstance(self.sock, ssl.SSLSocket):
            raise ConfigError("Andmeühendus ilma kontrollitud TLS-ita on keelatud.")
        connection, size = ftplib.FTP.ntransfercmd(self, cmd, rest)
        try:
            secured = self.context.wrap_socket(connection, server_hostname=self.host, session=self.sock.session)
        except Exception:
            connection.close()
            raise
        return secured, size


class ReadOnlyFTPS(VerifiedFTPS):
    """Protocol-level guard: a probe can never send upload/delete/rename commands."""
    allowed = {"AUTH", "USER", "PASS", "PBSZ", "PROT", "TYPE", "PASV", "EPSV", "PWD", "CWD", "MLSD", "QUIT"}

    def putcmd(self, line):
        if line.split(" ", 1)[0].upper() not in self.allowed:
            raise ConfigError("Lugemiskontroll blokeeris muutmiskäsu.")
        if line.startswith("PROT ") and line != "PROT P":
            raise ConfigError("Krüpteerimata andmeühendus on keelatud.")
        super().putcmd(line)


def connect(config, readonly=False):
    context = ssl.create_default_context()
    context.minimum_version = ssl.TLSVersion.TLSv1_2
    context.check_hostname = True
    context.verify_mode = ssl.CERT_REQUIRED
    client = (ReadOnlyFTPS if readonly else VerifiedFTPS)(context=context, timeout=30)
    try:
        client.connect(config["host"], config["port"])
        client.auth()  # TLS handshake and certificate validation BEFORE USER/PASS.
        client.login(config["user"], config["password"], secure=True)
        client.prot_p()  # Encrypt data connections; no fallback to PROT C or plain FTP.
        client.set_pasv(True)
        return client
    except Exception:
        client.close()
        raise


def report(label, value):
    # Server replies are untrusted. JSON escapes newlines and workflow commands.
    def redact(item):
        if isinstance(item, dict):
            return {key: redact(val) for key, val in item.items()}
        if isinstance(item, list):
            return [redact(val) for val in item]
        if isinstance(item, str):
            for name in ("ZONE_FTP_HOST", "ZONE_FTP_PORT", "ZONE_FTP_USERNAME", "ZONE_FTP_PASSWORD", "ZONE_FTP_TARGET_PATH"):
                secret = os.environ.get(name)
                if secret:
                    item = item.replace(secret, "[REDACTED]")
        return item
    message = json.dumps(redact(value), ensure_ascii=True)
    print(label + ": " + message)


def list_directory(client):
    entries = []
    for name, facts in client.mlsd(facts=["type", "size"]):
        if len(entries) >= 100:
            raise ConfigError("Kataloog sisaldab üle 100 kirje; kontrolli õiget FTP kasutaja algkataloogi.")
        entries.append({"name": name, "type": facts.get("type"), "size": facts.get("size")})
    return entries


def probe(client):
    report("FTP algkataloog (PWD)", client.pwd())
    entries = list_directory(client)
    report("Algkataloogi kirjed", entries)
    if any(entry["name"] == "htdocs" and entry["type"] == "dir" for entry in entries):
        client.cwd("htdocs")  # Candidate inspection only; does not confirm a deploy path.
        report("htdocs kontrolli PWD (omanik peab kinnitama)", client.pwd())
        report("htdocs kirjed", list_directory(client))
    else:
        print("htdocs alamkausta ei tuvastatud. Ära oleta /htdocs sihtteed; kontrolli algkataloogi Zone'is.")
    print("Lugemiskontroll valmis. Faile ei loodud, muudetud ega kustutatud; avaldamislukk jäi muutmata.")


def enter_target(client, target):
    client.cwd(target)
    if client.pwd().rstrip("/") != target:
        raise ConfigError("Serveri PWD ei vasta kinnitatud FTP sihtteele. Kinnita lugemiskontrollis tegelik tee.")


def read_index(client):
    data = io.BytesIO()
    def receive(chunk):
        if data.tell() + len(chunk) > 10 * 1024 * 1024:
            raise ConfigError("Olemasolev index.html ületab varunduse 10 MB piiri. Kontrolli sihtkohta.")
        data.write(chunk)
    # Missing/unreadable index is a hard failure, not permission to overwrite anything.
    client.retrbinary("RETR index.html", receive)
    return data.getvalue()


def backup_index(client, directory):
    data = read_index(client)
    directory.mkdir(parents=True, exist_ok=False)
    (directory / "index.html").write_bytes(data)
    (directory / "sha256.txt").write_text(hashlib.sha256(data).hexdigest() + "\n", encoding="ascii")
    print("Olemasolev index.html salvestatud kohalikku varukoopiasse. Serverit ei muudetud.")


def build_files(root):
    if root.is_symlink() or not root.is_dir():
        raise ConfigError("dist kataloog puudub või on sümboolne link.")
    files = []
    for path in sorted(root.rglob("*")):
        if path.is_symlink():
            raise ConfigError("Build ei tohi sisaldada sümboolseid linke.")
        if any(not re.fullmatch(r"[A-Za-z0-9_.-]+", part) for part in path.relative_to(root).parts):
            raise ConfigError("Build sisaldab sobimatut failinime.")
        if path.is_file():
            files.append(path.relative_to(root).as_posix())
    if "index.html" not in files:
        raise ConfigError("dist/index.html puudub. Käivita build.")
    return [file for file in files if file != "index.html"] + ["index.html"]


def upload(client, config, root, files, backup):
    saved = (backup / "index.html").read_bytes()
    digest = (backup / "sha256.txt").read_text(encoding="ascii").strip()
    if hashlib.sha256(saved).hexdigest() != digest or read_index(client) != saved:
        raise ConfigError("Varukoopia on vigane või serveri index.html muutus pärast varundust. Üleslaadimine peatatud.")
    target = config["target"]
    directories = sorted({str(Path(file).parent).replace("\\", "/") for file in files if "/" in file}, key=lambda p: (p.count("/"), p))
    # Check/create only build subdirectories, never create or infer the target root.
    for directory in directories:
        enter_target(client, target)
        expected = target
        for part in directory.split("/"):
            try:
                client.cwd(part)
            except ftplib.error_perm as error:
                if not str(error).startswith("550"):
                    raise
                client.mkd(part)
                client.cwd(part)
            expected += "/" + part
            if client.pwd().rstrip("/") != expected:
                raise ConfigError("Ressursikataloog väljub kinnitatud sihtteest või on ümber suunatud.")
    enter_target(client, target)
    for file in files:
        with (root / file).open("rb") as handle:
            client.storbinary("STOR " + file, handle)
    print("FTPS üleslaadimine valmis. Ressursid laaditi enne index.html faili; serverifaile ei kustutatud.")


def main(argv=None):
    parser = argparse.ArgumentParser(description="Zone explicit FTPS: probe, backup või deploy")
    parser.add_argument("mode", choices=["probe", "backup", "deploy"])
    args = parser.parse_args(argv)
    client = None
    try:
        config = validate_config(os.environ, args.mode)
        root, backup = Path("dist"), Path(".deployment-backup")
        files = build_files(root) if args.mode == "deploy" else []
        if args.mode == "deploy" and not (backup / "sha256.txt").is_file():
            raise ConfigError("Varukoopia puudub. Enne avaldamist varunda index.html ja säilita artefakt.")
        client = connect(config, readonly=args.mode == "probe")
        if args.mode == "probe":
            probe(client)
        else:
            enter_target(client, config["target"])
            if args.mode == "backup":
                backup_index(client, backup)
            else:
                upload(client, config, root, files, backup)
        return 0
    except ConfigError as error:
        print("::error::" + str(error), file=sys.stderr)
    except ssl.SSLCertVerificationError:
        print("::error::FTPS sertifikaadi või hostinime kontroll ebaõnnestus. Küsi Zone'ilt sertifikaadile vastav FTP host; kontrolli ei tohi välja lülitada.", file=sys.stderr)
    except Exception:
        # Raw protocol errors can echo usernames, passwords and paths; never print them.
        print("::error::FTPS toiming ebaõnnestus. Kontrolli uut parooli, porti, TLS-i, võrgu ligipääsu, sihtteed ja õigusi. Serveri toorvastust saladuste kaitseks ei kuvata.", file=sys.stderr)
    finally:
        if client is not None:
            client.close()
    return 1


if __name__ == "__main__":
    sys.exit(main())
