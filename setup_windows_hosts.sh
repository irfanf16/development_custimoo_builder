#!/bin/bash

# Set the domain name
domain=$1

if [ -z "$domain" ]; then
    domain="custimoo-builder.local"
    echo "Site was not provided as first parameter - will default to $domain"
fi

# Change these values to match your Windows machine's IP address and hostname
WINDOWS_IP="127.0.0.1"
WINDOWS_HOSTNAME=$domain

# Change this value to the path of the hosts file on your Windows machine
#WINDOWS_HOSTS_FILE="test.txt"
WINDOWS_HOSTS_FILE="C:\\Windows\\System32\\drivers\\etc\\hosts"
#WINDOWS_HOSTS_FILE="/mnt/c/Windows/System32/drivers/etc/hosts"

if [ ! -w "$WINDOWS_HOSTS_FILE" ]; then
  echo "WARNING: $WINDOWS_HOSTS_FILE Could not access the file "
  ls -l "$WINDOWS_HOSTS_FILE"
  echo "WARNING: WINDOWS_HOSTS_FILE in script will be set to /mnt/c/Windows/System32/drivers/etc/hosts -- necessary for wsl ubuntu to work"
  WINDOWS_HOSTS_FILE="/mnt/c/Windows/System32/drivers/etc/hosts"
fi
if [ ! -w "$WINDOWS_HOSTS_FILE" ]; then
  echo "WARNING: $WINDOWS_HOSTS_FILE does not have write access! Please manually change it to have write access to current user"
  ls -l "$WINDOWS_HOSTS_FILE"
else
  # The contents to append to the hosts file
  HOSTS_ENTRY="$WINDOWS_IP    $WINDOWS_HOSTNAME"

  # Run the command to update the hosts file on the Windows machine
  #ssh Administrator@$WINDOWS_IP "echo '$HOSTS_ENTRY' >> $WINDOWS_HOSTS_FILE"
  #"echo '$HOSTS_ENTRY' '$domain'" | sudo tee -a /mnt/c/Windows/System32/drivers/etc/hosts"
  echo "$HOSTS_ENTRY"  | sudo tee -a $WINDOWS_HOSTS_FILE
fi



