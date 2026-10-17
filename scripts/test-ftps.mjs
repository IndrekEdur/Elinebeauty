import { spawnSync } from 'node:child_process';
const result = spawnSync(process.env.PYTHON || (process.platform === 'win32' ? 'python' : 'python3'),
  ['-m', 'unittest', 'discover', '-s', 'tests', '-p', 'test_*.py', '-v'], { stdio: 'inherit' });
if (result.error) console.error('FTPS testid vajavad Python 3.12+; määra vajadusel PYTHON käivitusfaili asukohaks.');
process.exit(result.status ?? 1);
