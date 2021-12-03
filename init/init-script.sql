-- create the databases
CREATE DATABASE IF NOT EXISTS customerdb;
USE customerdb;

CREATE TABLE IF NOT EXISTS `customers` (
  id int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  name varchar(255) NOT NULL,
  email varchar(255) NOT NULL,
  address varchar(255),
  blockHeight bigint(11),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- create the users for each database
CREATE USER 'root'@'%' IDENTIFIED BY '123456';
GRANT CREATE, ALTER, INDEX, LOCK TABLES, REFERENCES, UPDATE, DELETE, DROP, SELECT, INSERT ON `customerdb`.* TO 'root'@'%';

FLUSH PRIVILEGES;



