FROM php:8.3-apache

RUN docker-php-ext-install pdo pdo_mysql \
    && a2enmod rewrite headers

COPY composer.json /var/www/html/composer.json
COPY apache.conf /etc/apache2/sites-available/000-default.conf
COPY public/ /var/www/html/public/

RUN chown -R www-data:www-data /var/www/html \
    && printf "memory_limit=256M\nupload_max_filesize=20M\npost_max_size=20M\n" > /usr/local/etc/php/conf.d/tuapp.ini

WORKDIR /var/www/html
