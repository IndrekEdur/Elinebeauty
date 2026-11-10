import contextlib
import ftplib
import io
import tempfile
import unittest
from pathlib import Path
from scripts import deploy_invitation as deploy
from scripts import ftps


class Server:
    def __init__(self):
        self.current = '/htdocs'
        self.dirs = {'/htdocs'}
        self.data = {'/htdocs/index.html': b'LIVE HOMEPAGE'}
        self.writes = []

    def cwd(self, name):
        target = name.rstrip('/') if name.startswith('/') else self.current + '/' + name
        if target not in self.dirs:
            raise ftplib.error_perm('550 missing')
        self.current = target

    def pwd(self):
        return self.current

    def mlsd(self):
        result = []
        for name in self.dirs | set(self.data):
            if name.rsplit('/', 1)[0] == self.current:
                result.append((name.rsplit('/', 1)[1], {'type': 'dir' if name in self.dirs else 'file'}))
        return iter(result)

    def retrbinary(self, cmd, callback):
        callback(self.data[self.current + '/' + cmd[5:]])

    def mkd(self, part):
        self.dirs.add(self.current + '/' + part)

    def storbinary(self, cmd, handle):
        self.writes.append(cmd[5:])
        self.data[self.current + '/' + cmd[5:]] = handle.read()


class InvitationTests(unittest.TestCase):
    def test_prepare_and_upload_only_invitation_homepage_unchanged(self):
        with tempfile.TemporaryDirectory() as temp, contextlib.redirect_stdout(io.StringIO()):
            base = Path(temp)
            source = base / 'dist'
            (source / 'assets').mkdir(parents=True)
            (source / 'assets/app.js').write_text('import "/assets/shared.js"')
            (source / 'kutse').mkdir()
            (source / 'kutse/index.html').write_text('<script src="/assets/app.js"></script>')
            (source / 'kutse/rsvp.php').write_text('<?php echo 1;')
            (source / 'index.html').write_text('DO NOT DEPLOY')
            root = deploy.prepare(source, base / 'package')
            self.assertIn('/kutse/assets/app.js', (root / 'kutse/index.html').read_text())
            self.assertFalse((root / 'index.html').exists())
            client = Server()
            saved = base / 'backup'
            deploy.backup(client, root, saved)
            deploy.upload(client, root, saved)
            self.assertTrue(all(name.startswith('kutse/') for name in client.writes))
            self.assertEqual(client.writes[-1], 'kutse/index.html')
            self.assertEqual(client.data['/htdocs/index.html'], b'LIVE HOMEPAGE')

    def test_changed_homepage_blocks_all_writes(self):
        with tempfile.TemporaryDirectory() as temp, contextlib.redirect_stdout(io.StringIO()):
            root = Path(temp) / 'package'
            (root / 'kutse').mkdir(parents=True)
            (root / 'kutse/index.html').write_text('invitation')
            client = Server()
            saved = Path(temp) / 'saved'
            deploy.backup(client, root, saved)
            client.data['/htdocs/index.html'] = b'CHANGED'
            with self.assertRaises(ftps.ConfigError):
                deploy.upload(client, root, saved)
            self.assertEqual(client.writes, [])

    def test_existing_invitation_backed_up_and_change_blocks_writes(self):
        with tempfile.TemporaryDirectory() as temp, contextlib.redirect_stdout(io.StringIO()):
            root = Path(temp) / 'package'
            (root / 'kutse').mkdir(parents=True)
            (root / 'kutse/index.html').write_text('new')
            client = Server()
            client.dirs.add('/htdocs/kutse')
            client.data['/htdocs/kutse/index.html'] = b'old'
            saved = Path(temp) / 'saved'
            deploy.backup(client, root, saved)
            self.assertEqual((saved / 'kutse/index.html').read_bytes(), b'old')
            client.data['/htdocs/kutse/index.html'] = b'changed'
            with self.assertRaises(ftps.ConfigError):
                deploy.upload(client, root, saved)
            self.assertEqual(client.writes, [])
