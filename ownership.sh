#!/bin/bash
cd /home/kitbuilder-autodeployment/public_html/ && runuser -u kitbuilder-autodeployment npm install 
cd /home/kitbuilder-autodeployment/public_html/ && runuser -u kitbuilder-autodeployment npm run build >> build_.log
chown -R kitbuilder-autodeployment:kitbuilder-autodeployment /home/kitbuilder-autodeployment/public_html/
# cd /home/kitbuilder-autodeployment/public_html/ && runuser -u kitbuilder-autodeployment npm run build:wc:customizer:self
# cd /home/kitbuilder-autodeployment/public_html/ && runuser -u kitbuilder-autodeployment npm run build:wc:customizer:wordpress
# cd /home/kitbuilder-autodeployment/public_html/ && runuser -u kitbuilder-autodeployment npm run build:wc:orderdetail
# cp -R /home/kitbuilder-autodeployment/public_html/self_customizer/* /home/cdncustimoo/public_html/self_staging/
# cp -R /home/kitbuilder-autodeployment/public_html/wordpress_customizer/* /home/cdncustimoo/public_html/wordpress_staging/
# cp -R /home/kitbuilder-autodeployment/public_html/order_detail_customizer/* /home/cdncustimoo/public_html/santa_order_detail_staging/  
# chown -R cdncustimoo:cdncustimoo /home/cdncustimoo/public_html