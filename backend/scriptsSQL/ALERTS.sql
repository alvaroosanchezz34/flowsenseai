CREATE TABLE alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  process_id INT NOT NULL,
  step_id INT NULL,
  severity ENUM('low', 'medium', 'high') NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  ai_explanation TEXT NULL,
  acknowledged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (process_id) REFERENCES processes(id) ON DELETE CASCADE,
  FOREIGN KEY (step_id) REFERENCES steps(id) ON DELETE SET NULL
);
