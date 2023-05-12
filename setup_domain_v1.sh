#!/bin/bash

# Set the domain name
domain=$domain
build_directory_name=$build_directory_name

# Define a usage function
function usage {
#  echo "Usage: $0 [-f|--filename FILENAME] [-s|--size SIZE]" >&2
  echo "Below is the list of accepted parameters"
  echo "   -b, --builddirectoryname   Set the build directory name"
  echo "   -d, --domain               Set domain"
  echo "   -h, --help                 Display this help message"
  exit 1
}
# Parse command-line options/parameters
while [[ "$#" -gt 0 ]]; do
  case $1 in
    -b|--builddirectoryname) build_directory_name="$2"; shift ;;
    -d|--domain) domain="$2"; shift ;;
    -h|--help) usage ;;
    *) echo "Invalid option: $1" >&2; usage ;;
  esac
  shift
done

docroot=$( pwd )'/'"$build_directory_name"

# Create a new NGINX configuration file
config="/etc/nginx/sites-available/$domain"
sudo sh -c "echo 'server {
        listen 80;
        listen [::]:80;

        root $docroot;
        index index.html index.html index.htm;

        server_name $domain www.$domain;

        location / {
                try_files \$uri \$uri/ /index.html?\$query_string;
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

