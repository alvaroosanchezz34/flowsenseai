CREATE TABLE step_metrics_daily (
  id INT AUTO_INCREMENT PRIMARY KEY,
  step_id INT NOT NULL,
  avg_duration_seconds INT NOT NULL,
  date DATE NOT NULL,

  UNIQUE (step_id, date),
  FOREIGN KEY (step_id) REFERENCES steps(id) ON DELETE CASCADE
);
