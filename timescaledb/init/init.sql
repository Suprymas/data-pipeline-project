
CREATE EXTENSION IF NOT EXISTS timescaledb;


CREATE TABLE IF NOT EXISTS statistics (
  time timestamptz NOT NULL,
  article TEXT NOT NULL,
  production_order TEXT NOT NULL,
  target_cycle_time DOUBLE PRECISION NOT NULL,
  actual_cycle_time DOUBLE PRECISION NOT NULL,
  target_co2_pressure DOUBLE PRECISION NULL,
  actual_co2_pressure DOUBLE PRECISION NULL,
  machine_status TEXT,
  PRIMARY KEY (time, article, production_order)
);


SELECT create_hypertable('statistics', 'time', chunk_time_interval => INTERVAL '1 day', if_not_exists => TRUE);


CREATE INDEX IF NOT EXISTS idx_statistics_article ON statistics (article);
CREATE INDEX IF NOT EXISTS idx_statistics_production_order ON statistics (production_order);


SELECT add_retention_policy('statistics', INTERVAL '30 days');


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



