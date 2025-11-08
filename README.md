data-pipeline-project
---

## About this project
This is a project from [FHV](https://www.fhv.at) university course "Advanced Data Management" \
We are simulating a beverage filling machine which is hooked up to a several step data pipeline.
In this pipeline is MQTT agent which takes in messages from machine which is in a form of OPC-UA server.
Translates these messages into MQTT format sends them to MQTT broker. Then there is Redis which keeps
current state of the machine variables. Also to MQTT broker is connected RedPanda which is a Kafka alternative
it stores enriched messages from Redis. Finally, there is Grafana which displays graphs and TimescaleDB
which lets us create continuous aggregates to better display data in Grafana.

---

## How to run it

Clone this repository then 
```bash
cd data-pipeline-project
```
Then run
```bash
docker-compose up -d
```

On first run it will build [```OPC-Server.js```](OPC-Server.js) and [```MQTT-Agent.js```](MQTT-Agent.js). It will apply the necessary schema to the 
TimescaleDB. 
And it will create folders: ```grafana-data/```, ```mosquitto-data/```,
```redis-data/```, ```redpanda-data/```, ```timescaledb-data/data``` 


You can see how the OPC-UA Server and MQTT Agent is built in [```Dockerfile```](Dockerfile)


