#!/bin/bash
chown -R santa-builder:santa-builder /home/santa-builder/public_html/
cp -R /home/santa-builder/public_html/self_customizer/* /home/cdncustimoo/public_html/self/
cp -R /home/santa-builder/public_html/wordpress_customizer/* /home/cdncustimoo/public_html/wordpress/
cp -R /home/santa-builder/public_html/order_detail_customizer/* /home/cdncustimoo/public_html/santa_order_detail/  
chown -R cdncustimoo:cdncustimoo /home/cdncustimoo/public_html