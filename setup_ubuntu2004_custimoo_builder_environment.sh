#!/bin/bash
PARENT_DIR="${PWD##*/}"

# Set the domain name
domain="custimoo_builder.test"
backend_domain="http://custimoo-v2-backend.test"
build_mode="production"
# Check if domain parameter set
if [ -n "$DOMAIN_NAME" ]; then
  domain="$DOMAIN_NAME"
fi
# Check if backend domain name parameter set
if [ -n "$BACKEND_DOMAIN_NAME" ]; then
  backend_domain="$BACKEND_DOMAIN_NAME"
fi
# Check if build type parameter set
if [ -n "$MODE" ]; then
  build_mode="$MODE"
fi

backend_domain_escaped=$(echo "$backend_domain" | sed 's/\//\\\//g')

# Check webserver
if which nginx >/dev/null; then
  echo "********** Nginx is already installed the version is: $(nginx -v) **********"
  sudo service nginx enable
  sudo service nginx start
  sudo service nginx status
else
  # Install Nginx
  echo "**********   NGINX INSTALLATION START  **********"
  sudo apt-get update -y
  sudo apt-get install nginx -y
  sudo service nginx enable
  sudo service nginx start
  sudo service nginx status
  echo "**********   NGINX INSTALLATION END  **********"
fi
# Check Node server
if which nvm >/dev/null; then
  echo "********** NVM is already installed the version is: $(nvm -version) **********"
else
  echo "**********  NVM IS NOT INSTALLED. NVM AND NODE INSTALLATION START  **********"
  sudo apt-get install curl
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
  command -v nvm
  # Source the NVM script to load it into the current shell
  source ~/.nvm/nvm.sh
  nvm install v14.16
  nvm use 14.16 ## using node v14.16.1 (npm v6.14.12)
  echo "**********   NODE INSTALLATION END  **********"
fi

# Run following commands after installing node
echo "********** NPM RUNNING  **********"
npm cache clean --force
npm install
echo "********** END NPM INSTALLED **********"

# run project
if [ "$build_mode" == "production" ]; then
  # Check if domain already is in /var/www/ directory
  if [ ! -d /var/www/$domain ]; then
    echo "********** CREATING VIRTUAL HOST  **********"
    # Create virtual host for project on Nginx
    ./setup_domain.sh $domain
    echo "********** SETTING DOMAIN NAME IN HOST FILE START  **********"
    ./setup_dns.sh $domain y
    ./setup_windows_hosts.sh $domain
    echo "********** SETTING DOMAIN NAME IN HOST FILE END   **********"
  fi
  # changing backend domain url in the inv file
  sed -i "s/VUE_APP_API_BASE_URL=.*/VUE_APP_API_BASE_URL=$backend_domain_escaped/g" .env.production

  npm run build:wc:customizer:ecommerce
  npm run build:wc:customizer:self
  npm run build:wc:orderdetail

  sudo rm -rf /var/www/$domain/*
  sudo mv ./wordpress_customizer /var/www/$domain/
  sudo mv ./self /var/www/$domain/
  sudo mv ./santa_order_detail /var/www/$domain/

  echo "check following urls in your browser"
  echo "http://$domain/self/demo.html"
  echo "http://$domain/wordpress_customizer/demo.html"
  echo "http://$domain/santa_order_detail/demo.html"
elif [ "$build_mode" == "staging" ]; then
  # Check if domain already is in /var/www/ directory
  if [ ! -d /var/www/$domain ]; then
    echo "********** CREATING VIRTUAL HOST  **********"
    # Create virtual host for project on Nginx
    ./setup_domain.sh $domain
    echo "********** SETTING DOMAIN NAME IN HOST FILE START  **********"
    ./setup_dns.sh $domain y
    ./setup_windows_hosts.sh $domain
    echo "********** SETTING DOMAIN NAME IN HOST FILE END   **********"
  fi
  # changing backend domain url in the inv file
  sed -i "s/VUE_APP_API_BASE_URL=.*/VUE_APP_API_BASE_URL=$backend_domain_escaped/g" .env.staging

  npm run build:wc:customizer:ecommerce:staging
  npm run build:wc:customizer:self:staging
  npm run build:wc:orderdetail:staging

  sudo rm -rf /var/www/$domain/*
  sudo mv ./wordpress_customizer_staging /var/www/$domain/
  sudo mv ./self_staging /var/www/$domain/
  sudo mv ./santa_order_detail_staging /var/www/$domain/

  echo "check following urls in your browser"
  echo "http://$domain/self_staging/demo.html"
  echo "http://$domain/wordpress_customizer_staging/demo.html"
  echo "http://$domain/santa_order_detail_staging/demo.html"
else
  if [ -e .env.development ]; then
    echo "File exists, skipping."
  else
    cp .env.example .env.development
    # changing backend domain url in the inv file
    sed -i "s/VUE_APP_API_BASE_URL=.*/VUE_APP_API_BASE_URL=$backend_domain_escaped/g" .env.development
  fi
  npm run serve
fi

sudo chown -R $USER:$USER /var/www/$domain