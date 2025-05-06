#!/bin/bash
echo "Please provide a path to cypress dir."
echo "For example: /Users/username/git/private/ekompanija_cypress/cypress"
echo "Enter path and press ENTER:"
# shellcheck disable=SC2162
read path
if  [[ -d $path ]]
then
  scp "$path"/reports/mochareports/report.html root@134.209.244.95:/var/www/html/index.html
  scp "$path"/reports/mochareports/report.json root@134.209.244.95:/var/www/html/report.json
  scp -r "$path"/reports/mochareports/assets  root@134.209.244.95:/var/www/html
  scp -r "$path"/screenshots/*  root@134.209.244.95:/var/www/html/screenshots
  scp -r "$path"/videos/*  root@134.209.244.95:/var/www/html/videos
else
    echo "Path to dir is required"
fi
