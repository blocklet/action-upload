const fs = require('fs');
const path = require('path');
const core = require('@actions/core');
const shell = require('shelljs');

const skip = core.getInput('skip');
if (skip === 'true') {
  console.log('Skip upload to registry action');
  return;
}

(async () => {
  const workingDirectory = core.getInput('workgin-directory');
  const endpoint = core.getInput('endpoint', { required: true });
  const accessToken = core.getInput('access-token');
  const developerSk = core.getInput('developer-sk');
  const filePath = core.getInput('file-path');

  try {
    const cdRes = shell.cd(workingDirectory);
    if (cdRes.code !== 0) {
      throw new Error(`Failed to change directory to ${workingDirectory}`);
    }

    const file = path.join(process.cwd(), filePath);
    if (!fs.existsSync(file)) {
      throw new Error('Missing file at .blocklet/release/blocklet.json');
    }
    console.log('Uploading using github action');

    if (!(accessToken || developerSk)) {
      throw new Error('Missing access token or developer sk');
    }
    const configRes = shell.exec(`blocklet config set registry ${endpoint}`);
    if (configRes.code !== 0) {
      throw new Error(`Failed to set registry: ${configRes.stderr}`);
    }

    if (accessToken) {
      const uploadRes = shell.exec(`blocklet upload ${file} --access-token ${accessToken}`);
      if (uploadRes.code !== 0) {
        throw new Error(`Failed to upload: ${uploadRes.stderr}`);
      }
    } else {
      const publishRes = shell.exec(`blocklet publish ${file} --developer-sk ${developerSk}`);
      if (publishRes.code !== 0) {
        throw new Error(`Failed to publish: ${publishRes.stderr}`);
      }
    }
    console.log(`Upload blocklet to ${endpoint} success!`);
  } catch (error) {
    core.setFailed(error.message);
  }
})();
