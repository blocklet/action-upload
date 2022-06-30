const fs = require('fs');
const path = require('path');
const core = require('@actions/core');
const shell = require('shelljs');

async function sendSlackMessage(webhook, data) {
  if (webhook) {
    await axios.post(webhook, data);
  }
}
function printAble(data) {
  return data.split(' ');
}

const skip = core.getInput('skip');
if (skip === 'true') {
  console.log('Skip upload to registry action');
  return;
}

(async () => {
  try {
    const workingDirectory = core.getInput('working-directory');
    const endpoint = core.getInput('endpoint', { required: true });
    const slackWebhook = core.getInput('slack-webhook');
    const accessToken = core.getInput('access-token') || core.getInput('developer-sk');
    const filePath = core.getInput('file-path');
    const developerDid = core.getInput('developer-did');

    const cdRes = shell.cd(workingDirectory);
    if (cdRes.code !== 0) {
      throw new Error(`Failed to change directory to ${workingDirectory}`);
    }

    const file = path.join(process.cwd(), filePath);
    if (!fs.existsSync(file)) {
      throw new Error('Missing file at .blocklet/release/blocklet.json');
    }
    const { version, name } = JSON.parse(fs.readFileSync(file, 'utf-8'));
    console.log('Uploading using github action');

    if (!accessToken) {
      throw new Error('Missing access token or developer sk');
    }
    const configRes = shell.exec(`blocklet config set registry ${endpoint}`);
    if (configRes.code !== 0) {
      throw new Error(`Failed to set registry: ${configRes.stderr}`);
    }
    if (developerDid) {
      const configDidRes = shell.exec(`blocklet config set developerDid ${developerDid}`);
      if (configDidRes.code !== 0) {
        throw new Error(`Failed to set registry: ${configDidRes.stderr}`);
      }
    }

    const uploadRes = shell.exec(`blocklet upload ${file} --access-token ${accessToken}`);
    if (uploadRes.code !== 0) {
      throw new Error(`Failed to upload: ${uploadRes.stderr}`);
    }
    console.log(`Upload blocklet to ${endpoint} success!`);

    await sendSlackMessage(slackWebhook, {
      text: `${name} v${version} was successfully upload to ${printAble(endpoint)}`,
    });
  } catch (error) {
    core.setFailed(error.message);
  }
})();
