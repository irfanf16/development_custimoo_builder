#!/bin/bash
wwwroot="/var/www/"
sites_enabled="/etc/nginx/sites-enabled/"
sites_available="/etc/nginx/sites-available/"

PARENT_DIR="${PWD##*/}"

# Set the domain name
domain=$1
# Check if the first parameter is empty
if [ -z "$1" ]; then
    domain="custimoo_builder.local"
    echo "first parameter is empty. Will set site to $domain"
fi

if [ ! -d "$wwwroot$domain" ]; then
    echo "The $domain is NOT in $wwwroot area, so it can NOT be cleaned up - exiting"
    #exit 1
else
    echo "Will now start to remove the site $domain - it will take some time..."
    sudo rm -rf $wwwroot$domain
    echo "Done - site has been removed"
fi

if [ ! -f "$sites_enabled$domain" ]; then
    echo "The site $domain are NOT present in $sites_enabled , so it can NOT be cleaned up - exiting"
    #exit 1
else
    echo "Will now start to remove the symbolic link file from the enabled site $domain "
    sudo rm $sites_enabled$domain
    echo "Done - link was removed from $sites_enabled"
fi

if [ ! -f "$sites_available$domain" ]; then
    echo "The site $domain are NOT present in $sites_available , so it can NOT be cleaned up - exiting"
    #exit 1
else
    echo "Will now start to remove the symbolic link file for the available site $domain "
    sudo rm $sites_available$domain
    echo "Done - link was removed from $sites_available"
fi

##
## The new command avoids overwriting the entire contents of the /etc/hosts file. 
## Instead, it first reads the current contents of the file using cat, then pipes the output to sed to remove the relevant line, 
## and finally uses tee to write the modified output back to the same file, while still preserving the file ownership and permissions.
## This approach ensures that the existing content of the file is preserved, 
## while the specific line containing custimoo-v22-backend.test is removed. 
## It also avoids the need to create a temporary file, reducing the risk of accidental data loss or corruption.
##
## In addition, by using sudo only once at the beginning of the command, we can avoid having to use it multiple times 
## throughout the command, which can make the command simpler and easier to read.
##
##sudo tee /mnt/c/Windows/System32/drivers/etc/hosts >/dev/null <<EOF
##$(sudo cat /mnt/c/Windows/System32/drivers/etc/hosts | sudo sed '/custimoo-v22-backend.test/d')
##EOF
##
echo "Remove site from windows hosts file..."
./remove_site_from_hosts.sh $domain
echo "Done - hosts file updated, removing the site $domain, unless error"
