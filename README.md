# action-upload

Use github action to upload blocklet to blocklet registry

Example workflow

```yml
on:
  push:
    # Sequence of patterns matched against refs/tags
    tags:
      - 'v*' # Push events to matching v*, i.e. v1.0, v20.15.10

name: Upload Blocklet

jobs:
  Deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v2
      - name: Build
        run: <build_your_blocklet> # after build, use `abtnode bundle --create-release` to bundle your blocklet
      - name: Upload to Registry
        uses: blocklet/action-upload@v0.1
        with:
          endpoint: ${{ secrets.TEST_REGISTRY }}
          access-token: ${{ secrets.TEST_REGISTRY_ACCESS_TOKEN }} # Or "developer-sk: ${{ secrets.ABTNODE_DEV_TEST_SK }}"
```
