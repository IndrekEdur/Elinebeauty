"""Manually authorized invitation-only deployment; never uploads the homepage."""
import os
from pathlib import Path
import shutil
import sys
import ftplib
import hashlib
import json
try:
    from scripts import ftps
except ModuleNotFoundError:
    import ftps


def prepare(source=Path('dist'), target=Path('.kutse-upload')):
    if target.exists():
        raise ftps.ConfigError('Kutse ajutine pakikataloog peab olema uus.')
    if not (source / 'kutse/index.html').is_file() or not (source / 'kutse/rsvp.php').is_file():
        raise ftps.ConfigError('Kutse HTML või RSVP saatja puudub.')
    # Keep every asset in the invitation's namespace, including local fonts.
    shutil.copytree(source / 'assets', target / 'kutse/assets')
    shutil.copy2(source / 'kutse/index.html', target / 'kutse/index.html')
    shutil.copy2(source / 'kutse/rsvp.php', target / 'kutse/rsvp.php')
    for path in target.rglob('*'):
        if path.suffix in ('.html', '.css', '.js'):
            path.write_text(path.read_text(encoding='utf-8').replace('/assets/', '/kutse/assets/'), encoding='utf-8')
    return target


def config():
    if os.environ.get('KUTSE_DEPLOY_APPROVED') != 'true':
        raise ftps.ConfigError('Kutse avaldamine vajab käsitsi kinnitust.')
    result = ftps.validate_config(os.environ, 'deploy')
    if result['target'] != '/htdocs':
        raise ftps.ConfigError('Omanik kinnitas ainult /htdocs sihtkoha.')
    return result


def files(root):
    result = ftps.build_files(root / 'kutse')
    return ['kutse/' + name for name in result]


def backup(client, root, destination):
    destination.mkdir(exist_ok=False)
    ftps.enter_target(client, '/htdocs')
    homepage = ftps.read_index(client)
    (destination / 'homepage.html').write_bytes(homepage)
    (destination / 'homepage.sha256').write_text(hashlib.sha256(homepage).hexdigest(), encoding='ascii')
    # Back up every existing file we will replace. Missing directories are handled
    # by listing their parent, not by interpreting a generic RETR error as absence.
    current = {'': {name: facts for name, facts in client.mlsd()}}
    manifest = {}
    for name in files(root):
        parent, leaf = name.rsplit('/', 1)
        parts = parent.split('/')
        chain = ''
        missing = False
        for part in parts:
            entry = current[chain].get(part)
            if entry is None:
                missing = True
                break
            if entry.get('type') != 'dir':
                raise ftps.ConfigError('Kutse sihtkataloog ei ole tavaline kataloog.')
            chain = (chain + '/' + part).lstrip('/')
            if chain not in current:
                ftps.enter_target(client, '/htdocs/' + chain)
                current[chain] = {n: f for n, f in client.mlsd()}
        entry = None if missing else current[parent].get(leaf)
        if entry is None:
            manifest[name] = None
            continue
        if entry.get('type') != 'file':
            raise ftps.ConfigError('Kutse sihtfail ei ole tavaline fail.')
        ftps.enter_target(client, '/htdocs/' + parent)
        data = bytearray()
        def receive(chunk):
            if len(data) + len(chunk) > 20 * 1024 * 1024:
                raise ftps.ConfigError('Varundatav kutsefail on liiga suur.')
            data.extend(chunk)
        client.retrbinary('RETR ' + leaf, receive)
        local = destination / name
        local.parent.mkdir(parents=True, exist_ok=True)
        local.write_bytes(data)
        manifest[name] = hashlib.sha256(data).hexdigest()
    (destination / 'manifest.json').write_text(json.dumps(manifest), encoding='utf-8')
    print('Avaleht ja kõik asendatavad kutsefailid varundatud; serverit ei muudetud.')


def upload(client, root, saved):
    ftps.enter_target(client, '/htdocs')
    if ftps.read_index(client) != (saved / 'homepage.html').read_bytes():
        raise ftps.ConfigError('Avaleht muutus pärast varundust; avaldamine peatatud.')
    manifest = json.loads((saved / 'manifest.json').read_text(encoding='utf-8'))
    names = files(root)
    if set(names) != set(manifest):
        raise ftps.ConfigError('Pakett ei vasta varukoopia manifestile.')
    # Re-list and compare before any write, including detecting newly created files.
    from tempfile import TemporaryDirectory
    with TemporaryDirectory() as temp:
        check = Path(temp) / 'check'
        backup(client, root, check)
        if json.loads((check / 'manifest.json').read_text()) != manifest:
            raise ftps.ConfigError('Kutsefailid muutusid pärast varundust.')
    for name, digest in manifest.items():
        if digest is not None and hashlib.sha256((saved / name).read_bytes()).hexdigest() != digest:
            raise ftps.ConfigError('Kutse varukoopia kontrollsumma ei klapi.')
    for parent in sorted({str(Path(name).parent).replace('\\', '/') for name in names}, key=lambda p: (p.count('/'), p)):
        ftps.enter_target(client, '/htdocs')
        expected = '/htdocs'
        for part in parent.split('/'):
            try:
                client.cwd(part)
            except ftplib.error_perm as error:
                if not str(error).startswith('550'):
                    raise
                client.mkd(part)
                client.cwd(part)
            expected += '/' + part
            if client.pwd().rstrip('/') != expected:
                raise ftps.ConfigError('Kutse kataloog on ümber suunatud.')
    ftps.enter_target(client, '/htdocs')
    for name in names:
        if not name.startswith('kutse/'):
            raise ftps.ConfigError('Lubatud on ainult kutse/ failid.')
        with (root / name).open('rb') as handle:
            client.storbinary('STOR ' + name, handle)
    ftps.enter_target(client, '/htdocs')
    if ftps.read_index(client) != (saved / 'homepage.html').read_bytes():
        raise ftps.ConfigError('Avalehe kontroll pärast avaldamist ebaõnnestus.')
    print('Ainult kutse/ avaldatud. Avalehe baitide samasus kontrollitud; faile ei kustutatud.')


if __name__ == '__main__':
    client = None
    try:
        mode = sys.argv[1]
        root = Path('.kutse-upload')
        if mode == 'prepare':
            prepare()
        elif mode in ('backup', 'deploy'):
            settings = config()
            files(root)  # Validate all paths before connecting.
            client = ftps.connect(settings)
            if mode == 'backup':
                backup(client, root, Path('.kutse-backup'))
            else:
                upload(client, root, Path('.kutse-backup'))
        else:
            raise ftps.ConfigError('Tundmatu kutse toiming.')
    except Exception:
        print('::error::Kutse toiming ebaõnnestus; kontrolli kinnitust, TLS-i, sihtteed, varukoopiat ja õigusi. Serveri toorviga ei logita.', file=sys.stderr)
        sys.exit(1)
    finally:
        if client is not None:
            client.close()
