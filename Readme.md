# Influxdb-Collector

Collect statistical data to influxdb

## Installation

```bash
$ git clone https://github.com/vicanso/influxdb-collector.git
```

## Examples

add single point use post method

```bash
curl -H "Content-Type: application/json" -X POST -d '{"measurement": "http", "tags":{"type": "0"},"fields":{"status":200},"time":"1422568543702900257"}' http://127.0.0.1:3000/add-points/albi
```

add multi points use post method

```bash
curl -H "Content-Type: application/json" -X POST -d '[{"measurement": "http", "tags":{"type": "0"},"fields":{"status":200}},{"measurement": "ajax", "tags":{"type": "1"},"fields":{"status":500}}]' http://127.0.0.1:3000/add-points/albi
```

add single point use get method
 
```bash
curl "http://127.0.0.1:3000/add-points/albi?point=measurement(http),fields(use|30,code|200),tags(type|2,spdy|fast),time(1422568543702910257)"
```

add multi points use get method

```bash
curl "http://127.0.0.1:3000/add-points/albi?point=measurement(http),tags(type|0,spdy|fast),fields(use|30,code|500),time(1422568543702905257)&point=measurement(ajax),tags(type|1,spdy|slow),fields(use|50,code|400),time(1422568543702909257)"
```

## License

MIT