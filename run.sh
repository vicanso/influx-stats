docker run -d --restart=always -e="LOG=timtam://192.168.2.1:7349" -e="NODE_ENV=production" -e="ETCD=http://192.168.2.1:2379" vicanso/influx-stats:0.0.1
