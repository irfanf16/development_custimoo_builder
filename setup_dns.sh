#!/bin/bash

# Set the domain name
domain=$1
# if parameter is y or Y, then update of DNS records will be done without a user prompt.
ignore=$2   


if [ -z "$domain" ]; then
    domain="custimoo-builder.local"
    echo "Site was not provided as first parameter - will default to $domain"
fi

if which ifconfig >/dev/null; then
    echo "ifconfig is already installed."
else
    echo "ifconfig is not installed. Installing necessary dependencies..."
    sudo apt-get update
    sudo apt-get install -y net-tools
fi

echo "fetch IP address of the system"
# Get the IP address of the system
ip_address=$(ifconfig | grep 'inet ' | grep -v '127.0.0.1' | sed 's/.*inet \([0-9\.]\+\).*/\1/')

if [ -z "$ip_address" ]; then
    echo "Unable to determine IP address."
    exit 1
fi

# Check the current DNS records for the domain
nslookup $domain

if [[ $ignore =~ ^[Yy]$ ]]; then
   echo "will update the DNS records for $domain to point to $ip_address "
   choice="y"
else
# Prompt the user to confirm that they want to update the DNS records
read -p "Are you sure you want to update the DNS records for $domain to point to $ip_address? (y/n) " choice
fi

if [[ $choice =~ ^[Yy]$ ]]; then
    # Update the DNS records
    echo "Updating DNS records for $domain..."
    nslookup -type=A $domain $ip_address
    nslookup $domain
    echo "DNS records updated successfully."
else
    echo "DNS records not updated."
fi

