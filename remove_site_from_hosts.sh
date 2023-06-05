#!/bin/bash

#line_to_remove="custimoo_builder.local"
line_to_remove=$1

# Check if the line exists in the file
if sudo grep -qF "$line_to_remove" /mnt/c/Windows/System32/drivers/etc/hosts; then
    # Remove the line using sed

sudo tee /mnt/c/Windows/System32/drivers/etc/hosts >/dev/null <<EOF
$(sudo cat /mnt/c/Windows/System32/drivers/etc/hosts | sudo sed "/$line_to_remove/d")
EOF
    
    echo "Line removed from hosts file."
else
    echo "Line not found in hosts file."
fi

# works
#sudo tee /mnt/c/Windows/System32/drivers/etc/hosts >/dev/null <<EOF
#$(sudo cat /mnt/c/Windows/System32/drivers/etc/hosts | sudo sed "/$line_to_remove/d")
#EOF

