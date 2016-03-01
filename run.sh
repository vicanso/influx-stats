docker run -d --restart=always -e="LOG=timtam://192.168.99.100:7349" -e="NODE_ENV=production" -e="ETCD=http://192.168.99.100:2379" vicanso/albi:2.0.0


curl -H "Content-Type: application/json" -X POST -d '{"series": "http", "tags":{"type": "0"},"values":{"status":200}}' http://127.0.0.1:3000/add-points/albi



curl "http://127.0.0.1:3000/add-points/albi?series=albi&tags=type|1||code|2&values=code|304||use|20"