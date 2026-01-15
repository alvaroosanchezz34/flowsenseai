CREATE TABLE process_metrics_daily (
  id INT AUTO_INCREMENT PRIMARY KEY,
  process_id INT NOT NULL,
  avg_duration_seconds INT NOT NULL,
  date DATE NOT NULL,

  UNIQUE (process_id, date),
  FOREIGN KEY (process_id) REFERENCES processes(id) ON DELETE CASCADE
);
