#!/bin/bash
cd /home/kitbuilder-autodeployment/public_html/ && runuser -u kitbuilder-autodeployment npm install 
cd /home/kitbuilder-autodeployment/public_html/&& runuser -u kitbuilder-autodeployment npm run build
chown -R kitbuilder-autodeployment:kitbuilder-autodeployment /home/kitbuilder-autodeployment/public_html/