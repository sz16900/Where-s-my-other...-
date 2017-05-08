DROP TABLE IF EXISTS Person;
DROP TABLE IF EXISTS Item;

CREATE TABLE Person (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone INTEGER NULL
);

CREATE TABLE Item (
  personId INTEGER,
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  CONSTRAINT personIdConstraint FOREIGN KEY (personId) REFERENCES Person(id)
);

INSERT INTO Person (name, email) VALUES ("rob", "rr@gmail.com");
INSERT INTO Person (name, email) VALUES ("seth", "sz@gmail.com");

INSERT INTO Item (personId, title, description) VALUES ("1", "Shoe", "A blue nike shoe, left, size 9");
INSERT INTO Item (personId, title, description) VALUES ("2", "Mitten", "A red mitten for the right hand");
