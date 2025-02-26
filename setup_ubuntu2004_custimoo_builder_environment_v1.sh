#!/bin/bash

#define script variables
working_directory=$(pwd)
parent_dir=$(basename "$(pwd)")
env_file_name=.env
#sudo chmod -R 777 ../$parent_dir

#parameters with default values
build_directory_name="artifacts"
domain="custimoo-builder.local"
move_to_nginx=true
api_url="http://custimoo-v2-backend.local"
modes=("development")
build_types=("selfcustomizer")
protocol="http"

# function starts
function createFile() {
      # Check if the directory exists
      if [[ ! -d "/var/www/$domain" ]]; then
          # Create the directory if it doesn't exist
          sudo mkdir "/var/www/$domain"
      fi
    # Check if an array argument is provided for dynamic content
    if [[ $# -gt 0 ]]; then
        dynamic_content=("$@")
    else
        dynamic_content=("<h1>Build link no available </h1>")
    fi

    # Create the index.html file
    cat >$build_directory_name/index.html <<EOF
<!DOCTYPE html>
<html>
<head>
    <title>Dynamic Content Example</title>
</head>
<body>
    <div id='dynamic-content'>
EOF

    # Append each element of the dynamic_content array to the index.html file
    for content in "${dynamic_content[@]}"; do
        echo "        <a href='$content'>$content</a><br/>" >> $build_directory_name/index.html
    done

    # Close the HTML tags
    echo "    </div>" >> $build_directory_name/index.html
    echo "</body>" >> $build_directory_name/index.html
    echo "</html>" >> $build_directory_name/index.html

    echo "index.html file created successfully! at $build_directory_name"
}


function usage {
  #  echo "Usage: $0 [-f|--filename FILENAME] [-s|--size SIZE]" >&2
  echo "Below is the list of accepted parameters"
  echo "   -b,   --builddirectoryname   Set the build directory name (default: $build_directory_name)"
  echo "   -mtn  --movetonginx          If true then move builds to nginx path (/var/www) (default: $move_to_nginx)"
  echo "   -p,   --protocol             Set the protocol. could have any one {http, https} (default: $protocol)"
  echo "   -d,   --domain               Set the domain name/virtual host with which you want to access build (default: $domain)"
  echo "   -u,   --apiurl               Set the build api url (default: $api_url)"
  echo "   -m,   --modes                Possible values are {development,production,serve,staging}. Set modes this could have
                                          multiple values separated with comma. (default: ${modes[*]})"
  echo "   -t, --buildtypes             Possible values are {ecommercecustomizer,selfcustomizer,orderdetail}
                                          Set modes this could have multiple values separated with comma.
                                          (default: ${build_types[*]})"
  echo "   -h, --help                   Display this help message"
  exit 1
}
# Parse command-line options/parameters
while [[ "$#" -gt 0 ]]; do
  case $1 in
  -b | --builddirectoryname)
    build_directory_name="$2"
    shift
    ;;
  -mtn | --movetonginx)
    move_to_nginx="$2"
    shift
    ;;
  -p | --protocol)
    protocol="$2"
    shift
    ;;
  -d | --domain)
    domain="$2"
    shift
    ;;
  -u | --apiurl)
    api_url="$2"
    shift
    ;;
  -m | --modes)
    IFS=',' read -r -a modes <<<"$2"
    shift
    ;;
  -t | --buildtypes)
    IFS=',' read -r -a build_types <<<"$2"
    shift
    ;;
  -h | --help) usage ;;
  *)
    echo "Invalid option: $1" >&2
    usage
    ;;
  esac
  shift
done
#function ends
api_url_escaped=$(echo "$api_url" | sed 's/\//\\\//g')
# If nginx is installed
if which nginx >/dev/null; then
  echo "********** Nginx is already installed the version is: $(nginx -v) **********"
  sudo service nginx enable
  sudo service nginx start
  sudo service nginx status
else # nginx is not installed. Then install it
  echo "**********   NGINX INSTALLATION START  **********"
  sudo apt-get update -y
  sudo apt-get install nginx -y
  sudo service nginx enable
  sudo service nginx start
  sudo service nginx status
  echo "**********   NGINX INSTALLATION END  **********"
fi

source ~/.nvm/nvm.sh # Source the NVM script to load it into the current shell
# If nvm is installed
if command -v nvm >/dev/null 2>&1; then
  echo "********** NVM is already installed the version is: $(nvm --version) **********"
  if nvm ls 14 | grep -q "v14\."; then
    printMessage "Node 14 is already installed"
    nvm use 14
  else
    printMessage "Installing Node 14..."
    nvm install 14
    nvm use 14
  fi
else # nvm is not installed. Then install it
  echo "**********  NVM installation started  **********"
  sudo apt-get install curl
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
  command -v nvm
  source ~/.nvm/nvm.sh # Source the NVM script to load it into the current shell
  nvm install v14
  nvm use 14 ## using node v14.16.1 (npm v6.14.12)
  echo "**********   NVM installation completed  **********"
fi

# Clean cache and install npm
#echo "********** NPM RUNNING  **********"
npm cache clean --force
npm install
#echo "********** END NPM INSTALLED **********"

#check if modes have serve mode then only run serve mode and do nothing
have_serve_mode=false
for mode in "${modes[@]}"; do
  if [ "$mode" = "serve" ]; then
    if [ ! -e .env.development ]; then
      sudo cp .env.example .env.development
      # changing backend domain url in the inv file
      sudo sed -i "s/VUE_APP_API_BASE_URL=.*/VUE_APP_API_BASE_URL=$api_url_escaped/g" .env.development
    fi
    npm run serve
    have_serve_mode=true
  fi
done

if ! $have_serve_mode; then
  vue_config_string_find_and_replace="// modify the options"
  last_mode="${modes[-1]}"
  for mode in "${modes[@]}"; do
    if [[ $mode != "production" ]] && [[ $mode != "staging" ]]; then
      # changing backend domain url in the inv file
      env_file_name=".env.$mode"
      if [ ! -e "$env_file_name" ]; then
        sudo cp .env.example "$env_file_name"
        # changing backend domain url in the inv file
        sudo sed -i "s/VUE_APP_API_BASE_URL=.*/VUE_APP_API_BASE_URL=$api_url_escaped/g" "$env_file_name"
      else
        sudo sed -i "s/VUE_APP_API_BASE_URL=.*/VUE_APP_API_BASE_URL=$api_url_escaped/g" "$env_file_name"
      fi
    fi
    for build_type in "${build_types[@]}"; do
      npm_command="buildv2:$build_type"
      echo "*********** npm running $npm_command"
      echo "npm "$npm_command
      sed -i "s|$vue_config_string_find_and_replace|$vue_config_string_find_and_replace..|g" ./vue.config.js
#      updateVueConfigFile
      sleep 1
      npm run "$npm_command:$mode"
       if [ "$mode" == "$last_mode" ]; then
           sed -i '/modify the options/c\/\/modify the options..' ./vue.config.js
        fi
    done
  done

  build_paths_index=0
  build_paths=()
  for mode in "${modes[@]}"; do
    for build_type in "${build_types[@]}"; do
      mv "$build_directory_name/$build_type/$mode/demo.html" "$build_directory_name/$build_type/$mode/index.html"
      build_paths[build_paths_index]="$protocol://$domain/$build_type/$mode"
      ((build_paths_index++))
    done
  done
  createFile "${build_paths[@]}"

  if [ "$move_to_nginx" = "true" ]; then
    sudo rm -rf /var/www/$domain/*
    sudo mv $build_directory_name/* /var/www/$domain
  fi

  echo "********** CREATING VIRTUAL HOST  **********"
  # Create virtual host
  sudo chmod -R 777 ./setup_domain_v1.sh
  ./setup_domain_v1.sh -d "$domain" -b "$build_directory_name" -mtn "$move_to_nginx"
  #check if windows hosts file does not have domain then add that domain
    if ! grep -q "$domain" /mnt/c/Windows/System32/drivers/etc/hosts; then
      sudo chmod -R 777 ./setup_windows_hosts.sh
      ./setup_windows_hosts.sh "$domain"
    fi
  echo "********** CREATING VIRTUAL HOST END  **********"
fi
git checkout vue.config.js
