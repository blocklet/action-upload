const core = require('@actions/core');
const shell = require('shelljs');

const file = path.join(process.cwd(), '.blocklet/release/blocklet.json');
if (!fs.existsSync(file)) {
  throw new Error('Missing file at .blocklet/release/blocklet.json');
}

try {
  console.log('Uploading using github action');
  const endpoint = core.getInput('endpoint');
  const accessToken = core.getInput('access-token');
  const configRes = shell.exec(`blocklet config set registry ${endpoint}`);
  if (configRes.code !== 0) {
    throw new Error(configRes.stderr);
  }

  if (accessToken) {
    const accessTokenRes = shell.exec(`blocklet upload --secret-key ${accessToken}`);
    if (accessTokenRes.code !== 0) {
      throw new Error(accessTokenRes.stderr);
    }
  } else {
    const developerSk = core.getInput('developer-sk');
    const developerSkRes = shell.exec(`blocklet publish --developer-sk ${developerSk}`);
    if (developerSkRes.code !== 0) {
      throw new Error(developerSkRes.stderr);
    }
  }
  console.log(`Upload blocklet to ${endpoint} success!`);
} catch (error) {
  core.setFailed(error.message);
}
