# Influx-stats

Collect stats to influxdb

## Installation

```bash
$ git clone https://github.com/vicanso/influx-stats.git
```

## Examples

add single point use post method

```bash
curl -H "Content-Type: application/json" -X POST -d '{"series": "http", "tags":{"type": "0"},"values":{"status":200}}' http://127.0.0.1:3000/add-points/albi
```

add multi points use post method

```bash
curl -H "Content-Type: application/json" -X POST -d '[{"series": "http", "tags":{"type": "0"},"values":{"status":200}},{"series": "ajax", "tags":{"type": "1"},"values":{"status":500}}]' http://127.0.0.1:3000/add-points/albi
```

add single point use get method
 
```bash
curl "http://127.0.0.1:3000/add-points/albi?point=series(http),tags(type|0,spdy|fast),values(use|30,code|500)"
```

add multi points use get method

```bash
curl "http://127.0.0.1:3000/add-points/albi?point=series(http),tags(type|0,spdy|fast),values(use|30,code|500)&point=series(ajax),tags(type|1,spdy|slow),values(use|50,code|400)"
```

## License

MIT