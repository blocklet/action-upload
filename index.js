const fs = require('fs');
const path = require('path');
const core = require('@actions/core');
const exec = require('@actions/exec');

const skip = core.getInput('skip');
if (skip) {
  console.log('Skip upload to registry action');
  return;
}

(async () => {
  const file = path.join(process.cwd(), '.blocklet/release/blocklet.json');
  if (!fs.existsSync(file)) {
    throw new Error('Missing file at .blocklet/release/blocklet.json');
  }

  try {
    console.log('Uploading using github action');
    const endpoint = core.getInput('endpoint', { required: true });
    const accessToken = core.getInput('access-token');
    const developerSk = core.getInput('developer-sk');
    if (!(accessToken || developerSk)) {
      throw new Error('Missing access token or developer sk');
    }
    await exec.exec(`blocklet config set registry ${endpoint}`, [], {
      listeners: {
        stderr(err) {
          throw new Error(err.toString());
        },
      },
    });

    if (accessToken) {
      exec.exec(`blocklet upload --access-token ${accessToken}`, [], {
        listeners: {
          stderr(err) {
            throw new Error(err.toString());
          },
        },
      });
    } else {
      exec.exec(`blocklet publish --developer-sk ${developerSk}`, [], {
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
})();
