import test from 'node:test';
import assert from 'node:assert/strict';
import { validateConfig } from '../scripts/deploy-config.mjs';
const sample = { ZONE_DEPLOY_ENABLED: 'true', ZONE_HOST: 'host.example.test', ZONE_PORT: '22', ZONE_USERNAME: 'deploy', ZONE_SSH_KEY: '-----BEGIN OPENSSH PRIVATE KEY-----\nTEST ONLY\n-----END OPENSSH PRIVATE KEY-----', ZONE_TARGET_PATH: '/srv/test/htdocs', ZONE_CONFIRMED_TARGET_PATH: '/srv/test/htdocs', ZONE_KNOWN_HOSTS: 'host.example.test ssh-ed25519 TEST_ONLY' };
test('kinnitatud konfiguratsioon läbib vormingukontrolli', () => assert.equal(validateConfig(sample).target, '/srv/test/htdocs'));
test('puuduv seadistus peatab avaldamise selge teatega', () => assert.throws(() => validateConfig({}), /ZONE_HOST.*ZONE_KNOWN_HOSTS/));
test('lukustatud avaldamine ei läbi kontrolli', () => assert.throws(() => validateConfig({ ...sample, ZONE_DEPLOY_ENABLED: 'false' }), /lukus/));
test('kinnitamata veebijuur ei läbi kontrolli', () => assert.throws(() => validateConfig({ ...sample, ZONE_CONFIRMED_TARGET_PATH: '/other/site/root' }), /ei vasta/));
test('ebaturvalised teed ei läbi kontrolli', () => {
  for (const path of ['/', '/srv', '/srv/test/../root', '/srv/test/./root', '/srv/test/root\nrm *', '/srv/test/root"', '/srv/test/root/']) assert.throws(() => validateConfig({ ...sample, ZONE_TARGET_PATH: path, ZONE_CONFIRMED_TARGET_PATH: path }), /veebijuure/);
});
test('hosti, kasutaja ja pordi süstimine on tõkestatud', () => {
  for (const [key, value] of [['ZONE_HOST', '-oProxyCommand=x'], ['ZONE_USERNAME', 'user@other'], ['ZONE_PORT', '65536'], ['ZONE_PORT', '22 -oX']]) assert.throws(() => validateConfig({ ...sample, [key]: value }));
});
