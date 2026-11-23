<?php
declare(strict_types=1);

$dsn = getenv('MCARE_DB_DSN') ?: 'mysql:host=127.0.0.1;dbname=mcare;charset=utf8mb4';
$user = getenv('MCARE_DB_USER') ?: 'root';
$pass = getenv('MCARE_DB_PASSWORD') ?: '';

try {
  $pdo = new PDO('mysql:host=127.0.0.1;charset=utf8mb4', $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
  $pdo->exec('CREATE DATABASE IF NOT EXISTS mcare');
  $pdo->exec('USE mcare');

  // Base rapidSMS/legacy tables
  $pdo->exec("
    CREATE TABLE IF NOT EXISTS users (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(254) NOT NULL UNIQUE,
      full_name VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS districts (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS facilities (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS maternal_profiles (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      full_name VARCHAR(255) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      email VARCHAR(254) NULL,
      date_of_birth DATE NULL,
      district_id INT UNSIGNED NULL,
      facility_id INT UNSIGNED NULL,
      assigned_chw_id INT UNSIGNED NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS consent_records (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      maternal_id INT UNSIGNED NOT NULL,
      consented TINYINT(1) NOT NULL DEFAULT 1,
      recorded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS pregnancies (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      maternal_id INT UNSIGNED NOT NULL,
      gestation_weeks INT NOT NULL DEFAULT 21,
      expected_delivery DATE NULL,
      is_postpartum TINYINT(1) NOT NULL DEFAULT 0,
      delivery_date DATE NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS symptom_reports (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      maternal_id INT UNSIGNED NOT NULL,
      symptom_code VARCHAR(20) NOT NULL,
      severity VARCHAR(50) NOT NULL,
      notes TEXT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS mcare_api_sessions (
      token_hash CHAR(64) NOT NULL PRIMARY KEY,
      user_id INT UNSIGNED NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX mcare_api_sessions_user_idx (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS mcare_app_records (
      id VARCHAR(100) NOT NULL PRIMARY KEY,
      record_type VARCHAR(40) NOT NULL,
      patient_id VARCHAR(100) NULL,
      owner_email VARCHAR(254) NULL,
      payload JSON NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX mcare_app_records_type_idx (record_type),
      INDEX mcare_app_records_patient_idx (patient_id),
      INDEX mcare_app_records_owner_idx (owner_email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  ");

  // Seed districts & facilities
  $pdo->exec("
    INSERT IGNORE INTO districts (id, name) VALUES (1, 'Gasabo'), (2, 'Kicukiro'), (3, 'Nyarugenge');
    INSERT IGNORE INTO facilities (id, name) VALUES (1, 'Kacyiru Health Center'), (2, 'Kibagabaga Hospital'), (3, 'Masaka Hospital');
  ");

  // Demo accounts
  $demoUsers = [
    ['email' => 'mother@mcare.demo', 'name' => 'Beata Mukamana', 'role' => 'mother', 'password' => 'Mother123!'],
    ['email' => 'doctor@mcare.demo', 'name' => 'Dr. Eric Niyonzima', 'role' => 'nurse', 'password' => 'Doctor123!'],
    ['email' => 'chw@mcare.demo', 'name' => 'Aliane merci', 'role' => 'chw', 'password' => 'Chw123!'],
  ];

  $userStmt = $pdo->prepare("
    INSERT INTO users (email, full_name, role, password_hash, is_active)
    VALUES (?, ?, ?, ?, 1)
    ON DUPLICATE KEY UPDATE full_name=VALUES(full_name), role=VALUES(role), password_hash=VALUES(password_hash), is_active=1
  ");

  foreach ($demoUsers as $u) {
    $userStmt->execute([$u['email'], $u['name'], $u['role'], password_hash($u['password'], PASSWORD_DEFAULT)]);
  }

  // Get CHW id
  $chwId = (int)$pdo->query("SELECT id FROM users WHERE email='chw@mcare.demo'")->fetchColumn();

  // Seed maternal profile for Beata Mukamana
  $maternalStmt = $pdo->prepare("
    INSERT INTO maternal_profiles (id, full_name, phone, email, date_of_birth, district_id, facility_id, assigned_chw_id)
    VALUES (1, 'Beata Mukamana', '0788123456', 'mother@mcare.demo', '1998-05-14', 1, 1, ?)
    ON DUPLICATE KEY UPDATE full_name=VALUES(full_name), phone=VALUES(phone), email=VALUES(email), assigned_chw_id=VALUES(assigned_chw_id)
  ");
  $maternalStmt->execute([$chwId]);

  // Seed consent & pregnancy
  $pdo->exec("
    INSERT IGNORE INTO consent_records (id, maternal_id, consented, recorded_at)
    VALUES (1, 1, 1, NOW());

    INSERT IGNORE INTO pregnancies (id, maternal_id, gestation_weeks, expected_delivery, is_postpartum, delivery_date)
    VALUES (1, 1, 21, DATE_ADD(CURRENT_DATE, INTERVAL 19 WEEK), 0, NULL);
  ");

  echo "Database seeded successfully!\n";
} catch (Throwable $e) {
  fwrite(STDERR, "Seeding failed: " . $e->getMessage() . "\n");
  exit(1);
}
