const fs = require('fs');
const path = require('path');
const core = require('@actions/core');
const exec = require('@actions/exec');

const file = path.join(process.cwd(), '.blocklet/release/blocklet.json');
if (!fs.existsSync(file)) {
  throw new Error('Missing file at .blocklet/release/blocklet.json');
}

try {
  await exec.exec('pwd');
  await exec.exec('ls');
  console.log('Uploading using github action');
  const endpoint = core.getInput('endpoint');
  const accessToken = core.getInput('access-token');
  await exec.exec(`blocklet config set registry ${endpoint}`, {
    listeners: {
      stderr(err) {
        throw new Error(err.toString());
      },
    },
  });

  if (accessToken) {
    exec.exec(`blocklet upload --secret-key ${accessToken}`, {
      listeners: {
        stderr(err) {
          throw new Error(err.toString());
        },
      },
    });
  } else {
    const developerSk = core.getInput('developer-sk');
    exec.exec(`blocklet publish --developer-sk ${developerSk}`, {
      listeners: {
        stderr(err) {
          throw new Error(err.toString());
        },
      },
    });
  }
  console.log(`Upload blocklet to ${endpoint} success!`);
} catch (error) {
  core.setFailed(error.message);
}
