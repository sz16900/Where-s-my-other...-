DROP TABLE IF EXISTS Person;
DROP TABLE IF EXISTS Item;

CREATE TABLE Person (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone INTEGER NULL
);

CREATE TABLE Item (
  personEmail VARCHAR(100),
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  CONSTRAINT personEmailConstraint FOREIGN KEY (personEmail) REFERENCES Person(email)
);

INSERT INTO Person (name, email) VALUES ("rob", "rr@gmail.com");
INSERT INTO Person (name, email) VALUES ("seth", "sz@gmail.com");

INSERT INTO Item (personEmail, title, description) VALUES ("rr@gmail.com", "Shoe", "A blue nike shoe, left, size 9");
INSERT INTO Item (personIEmail, title, description) VALUES ("sz@gmail.com", "Mitten", "A red mitten for the right hand");
