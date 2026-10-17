import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export function validateConfig(env) {
  const required = ['ZONE_HOST', 'ZONE_PORT', 'ZONE_USERNAME', 'ZONE_SSH_KEY', 'ZONE_TARGET_PATH', 'ZONE_KNOWN_HOSTS', 'ZONE_CONFIRMED_TARGET_PATH'];
  const missing = required.filter(key => !env[key]?.trim());
  if (missing.length) throw new Error(`Puuduv deployment'i seadistus: ${missing.join(', ')}. Lisa production-keskkonna Secrets/Variables README järgi. Serveriga ühendust ei loodud.`);
  if (env.ZONE_DEPLOY_ENABLED !== 'true') throw new Error('Avaldamine on lukus. ZONE_DEPLOY_ENABLED peab olema true alles pärast omaniku kinnitust.');
  if (!/^[a-zA-Z0-9][a-zA-Z0-9.-]*$/.test(env.ZONE_HOST)) throw new Error('ZONE_HOST peab olema hostinimi või IPv4 aadress, ilma protokolli ja pordita.');
  if (!/^[1-9]\d{0,4}$/.test(env.ZONE_PORT) || Number(env.ZONE_PORT) > 65535) throw new Error('ZONE_PORT peab olema vahemikus 1–65535.');
  if (!/^[a-zA-Z0-9_][a-zA-Z0-9_.-]*$/.test(env.ZONE_USERNAME)) throw new Error('ZONE_USERNAME sisaldab lubamatuid märke.');
  const target = env.ZONE_TARGET_PATH;
  if (!/^\/(?:[a-zA-Z0-9_.-]+\/){2,}[a-zA-Z0-9_.-]+$/.test(target) || target.split('/').some(part => part === '.' || part === '..')) throw new Error('ZONE_TARGET_PATH peab olema kinnitatud absoluutne veebijuure tee vähemalt kolme kataloogitasemega, ilma lõpus oleva kaldkriipsu, tühikute ja .. osadeta.');
  if (target !== env.ZONE_CONFIRMED_TARGET_PATH) throw new Error('ZONE_TARGET_PATH ei vasta eraldi kinnitatud ZONE_CONFIRMED_TARGET_PATH väärtusele. Avaldamine peatatud.');
  if (!env.ZONE_SSH_KEY.includes('PRIVATE KEY-----')) throw new Error('ZONE_SSH_KEY peab sisaldama täielikku SSH privaatvõtit.');
  if (!env.ZONE_KNOWN_HOSTS.includes('ssh-') && !env.ZONE_KNOWN_HOSTS.includes('ecdsa-')) throw new Error('ZONE_KNOWN_HOSTS peab sisaldama kontrollitud OpenSSH known_hosts kirjet.');
  return { host: env.ZONE_HOST, port: env.ZONE_PORT, username: env.ZONE_USERNAME, target };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try { validateConfig(process.env); console.log('Deployment’i seadistus kontrollitud. Väärtusi ei logita.'); }
  catch (error) { console.error(`::error::${error.message}`); process.exitCode = 1; }
}
