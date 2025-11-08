# Project Documentation

---

## OPC-UA Server
### This program simulates a beverage filling machine 
### It has fields like this:
 - Information about the machine itself (machineName, serialNumber, plant, productionSegment, productionLine)
 - Information about the order (productionOrder, article, quantity)
 - Information about the targets of filling (targetFillVolume, targetLineSpeed, targetProductTemp, targetCO2Pressure, targetCapTorque, targetCycleTime)
 - Information about the actual state of filling (actualFillVolume, actualLineSpeed, actualProductTemp, actualCO2Pressure, actualCapTorque, actualCycleTime)
 - Machine statuses (cleaningCycleStatus, qualityCheckWeight, qualityCheckLevel, machineStatus, currentStation)
 - Quantity of bottles filled (goodBottles, badBottlesVolume, badBottlesWeight, badBottlesCap, badBottlesOther, totalBadBottles, totalBottles)
 - Statistics of order (goodBottlesOrder, badBottlesOrder, totalBottlesOrder, productionOrderProgress)
 - Miscellaneous information (currentLotNumber, expirationDate)

### Has alarms which notify:
 - Fill volume
 - Line speed
 - Production temperature
 - CO2 pressure
 - Cap torque
 - Cycle time

### Has methods like this:
 - "StartMachine" which starts the machine
 - "StopMachine" which stops the machine
 - "LoadProductionOrder" which lets you create new order
 - "EnterMaintenanceMode" which enters the machine into maintenance
 - "StartCipCycle" starts CIP cycle
 - "StartSipCycle" starts SIP cycle
 - "ResetCounters" which sets all the counters to 0
 - "ChangeProduct" changes the product in progress
 - "AdjustFillVolume" change the fill volume for bottles
 - "GenerateLotNumber" generates the lot number from current date, production order, article
 - "EmergencyStop" stops the machine in emergency mode

The machine updates variables randomly and then checks them every 2 seconds and calculates are they not crossing the thresholds.
Also, it stores the alarm history for three cycles to track specific error handling.



---
## System Architecture

If you want to use [UA expert](https://www.unified-automation.com/products/development-tools/uaexpert.html) to analyse how the OPC-Server works launch docker-compose.yaml and go to this link: **opc.tcp://localhost:4334/UA/fhvopcserver**

Using [MQTT Explorer](http://mqtt-explorer.com) or other MQTT analyser reach it by **mqtt://mqtt:1883** \
MQTT broker ([eclipse-mosquito](https://hub.docker.com/_/eclipse-mosquitto)) is running on **port 1883** 

[Redis](https://hub.docker.com/r/redis/redis-stack) is running on **port 6379** and you can access the console on **localhost:8001** where you will see 
hash "FluidFillExpress2" and inside it all fields

[Redpanda](https://hub.docker.com/r/redpandadata/redpanda) has no exposed ports to the host machine but you can acces it using
[Redpanda console](https://hub.docker.com/r/redpandadata/console) on **port 8085**

[TimescaleDB](https://hub.docker.com/r/timescale/timescaledb) is running on **port 5432** 

[Grafana](https://hub.docker.com/r/grafana/grafana) is running on **port 3000**



---
## Database Schema
Database schema is always applied on start of new container \
You can find it in [`timescaledb/init/init.sql`](timescaledb/init/init.sql)

Or take a look below 
```sql
-- Enable timescaledb extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Here we are creating a statistics table where we will keep all information about the machine messages
CREATE TABLE IF NOT EXISTS statistics (
  time timestamptz NOT NULL,
  article TEXT NOT NULL,
  production_order TEXT NOT NULL,
  target_cycle_time DOUBLE PRECISION NOT NULL,
  actual_cycle_time DOUBLE PRECISION NOT NULL,
  target_co2_pressure DOUBLE PRECISION NULL,
  actual_co2_pressure DOUBLE PRECISION NULL,
  machine_status TEXT,
  PRIMARY KEY (time, article, production_order) -- This will be our primary key. It is consisted of article, production_order and time to avoid duplication
);

-- We convert it into hyper table
SELECT create_hypertable('statistics', 'time', chunk_time_interval => INTERVAL '1 day', if_not_exists => TRUE);

-- Creating indexes if for example we want to see the statistics for each article or production_order
CREATE INDEX IF NOT EXISTS idx_statistics_article ON statistics (article);
CREATE INDEX IF NOT EXISTS idx_statistics_production_order ON statistics (production_order);

-- We are keeping the statistics for 30 days
SELECT add_retention_policy('statistics', INTERVAL '30 days');

-- Creating continuous aggregates
-- We are tracking average cycle time of the machine
CREATE MATERIALIZED VIEW IF NOT EXISTS statistics_hourly_kpis
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('1 hour', time) AS bucket,   -- aggregate by hour
    article,
    production_order,
    AVG(actual_cycle_time) AS avg_actual_cycle_time,
    AVG(target_cycle_time) AS avg_target_cycle_time,
    COUNT(*) AS num_records
FROM statistics
GROUP BY bucket, article, production_order
    WITH NO DATA;

-- We set how long we want to keep them to use them in grafana
SELECT add_continuous_aggregate_policy('statistics_hourly_kpis',
   start_offset => INTERVAL '1 day',
   end_offset => INTERVAL '1 hour',
   schedule_interval => INTERVAL '30 minutes'
);



CREATE MATERIALIZED VIEW IF NOT EXISTS statistics_daily_kpis
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('1 day', time) AS bucket,  -- aggregate by day
    article,
    production_order,
    AVG(actual_cycle_time) AS avg_actual_cycle_time,
    AVG(target_cycle_time) AS avg_target_cycle_time,
    COUNT(*) AS num_records,
    MIN(actual_cycle_time) AS min_actual_cycle_time,
    MAX(actual_cycle_time) AS max_actual_cycle_time
FROM statistics
GROUP BY bucket, article, production_order
WITH NO DATA;

SELECT add_continuous_aggregate_policy('statistics_daily_kpis',
   start_offset => INTERVAL '30 days',
   end_offset => INTERVAL '1 day',
   schedule_interval => INTERVAL '6 hours'
);


```

---
## Grafana

