git clone https://github.com/vicanso/influxdb-collector.git influxdb-collector

cd influxdb-collector

rm -rf .git

npm i

npm run test

rm -rf node_modules

npm i --production

modclean -n safe,caution,danger -r

docker build -t vicanso/influxdb-collector .

cd ..

rm -rf influxdb-collector