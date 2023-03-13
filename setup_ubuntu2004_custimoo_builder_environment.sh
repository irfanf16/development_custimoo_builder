#!/bin/bash
PARENT_DIR="${PWD##*/}"


apt-get update

### Install curl
apt-get install curl
### Install NVM
#curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
command -v nvm

# Source the NVM script to load it into the current shell
source ~/.nvm/nvm.sh

nvm --version 
nvm install v14.16
nvm use v14.16  ## using node v14.16.1 (npm v6.14.12)
npm install -g svgo
npm cache clean --force
npm install
npm install chromedriver --chromedriver_version=93.0.4577.63
### Compiles and minifies for production
npm run build
