#!/bin/bash

# Set the domain name
domain=$1

# Set the document root directory
docroot="/var/www/$domain/dist"

# Create the document root directory
sudo mkdir -p $docroot

# Create a new NGINX configuration file
config="/etc/nginx/sites-available/$domain"
sudo sh -c "echo 'server {
        listen 80;
        listen [::]:80;

        root $docroot;
        index index.html index.html index.htm;

        server_name $domain www.$domain;

        location / {
                try_files \$uri \$uri/ /index.html;
                add_header Access-Control-Allow-Origin *;
        }
        error_page 404 /;
       
}' > $config"

# Create a symbolic link to enable the site
sudo ln -s $config /etc/nginx/sites-enabled/


# Test the configuration
sudo nginx -t

# Reload NGINX to apply the new configuration
sudo service nginx reload

# Change ownership on site
sudo chown -R $USER:$USER $docroot

