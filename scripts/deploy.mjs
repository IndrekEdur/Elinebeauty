import { mkdtemp, writeFile, rm, readdir, lstat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { validateConfig } from './deploy-config.mjs';

const config = validateConfig(process.env); // Never connect before all gates pass.
const temporary = await mkdtemp(join(tmpdir(), 'eline-deploy-'));
const key = join(temporary, 'key');
const knownHosts = join(temporary, 'known_hosts');
const batch = join(temporary, 'upload.sftp');
function run(command, args, silent = false) {
  const result = spawnSync(command, args, { stdio: silent ? 'pipe' : 'inherit', timeout: 600_000 });
  if (result.error || result.status !== 0) throw new Error(`${command} ebaõnnestus. Kontrolli võtme vormingut, serveri usaldatud hostivõtit, SSH ligipääsu ning veebijuure õigusi. Saladusi ei logita.`);
}
async function filesIn(directory, relative = '') {
  const result = [];
  for (const name of await readdir(directory)) {
    if (!/^[a-zA-Z0-9_.-]+$/.test(name)) throw new Error('Build sisaldab üleslaadimiseks sobimatut failinime.');
    const file = join(directory, name);
    const stat = await lstat(file);
    if (stat.isSymbolicLink()) throw new Error('Sümboolsed lingid pole build’is lubatud.');
    const path = relative ? `${relative}/${name}` : name;
    if (stat.isDirectory()) result.push(...await filesIn(file, path));
    else if (stat.isFile()) result.push(path);
  }
  return result;
}
try {
  const files = await filesIn('dist');
  if (!files.includes('index.html')) throw new Error('dist/index.html puudub. Käivita build.');
  await writeFile(key, process.env.ZONE_SSH_KEY.replace(/\r/g, '').trim() + '\n', { mode: 0o600 });
  await writeFile(knownHosts, process.env.ZONE_KNOWN_HOSTS.replace(/\r/g, '').trim() + '\n', { mode: 0o600 });
  run('ssh-keygen', ['-y', '-P', '', '-f', key], true);
  const hostEntry = config.port === '22' ? config.host : `[${config.host}]:${config.port}`;
  run('ssh-keygen', ['-F', hostEntry, '-f', knownHosts], true);
  const directories = [...new Set(files.flatMap(file => {
    const parts = file.split('/'); parts.pop();
    return parts.map((_, index) => parts.slice(0, index + 1).join('/'));
  }))].sort((a, b) => a.split('/').length - b.split('/').length);
  const commands = [`cd "${config.target}"`, ...directories.map(path => `-mkdir "${path}"`)];
  // No rm/rmdir/delete commands. New assets precede HTML; old hashed assets stay available.
  for (const file of [...files.filter(file => file !== 'index.html'), 'index.html']) commands.push(`put "dist/${file}" "${file}"`);
  await writeFile(batch, commands.join('\n') + '\n', { mode: 0o600 });
  run('sftp', ['-b', batch, '-P', config.port, '-i', key, '-oBatchMode=yes', '-oIdentitiesOnly=yes', '-oStrictHostKeyChecking=yes', `-oUserKnownHostsFile=${knownHosts}`, '-oConnectTimeout=20', `${config.username}@${config.host}`]);
  console.log('Staatilised failid üles laaditud. Olemasolevaid faile ei kustutatud.');
} finally {
  await rm(temporary, { recursive: true, force: true }); // Only this runner's freshly created private temp directory.
}
