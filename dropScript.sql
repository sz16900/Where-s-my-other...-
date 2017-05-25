DROP TABLE IF EXISTS Person;
DROP TABLE IF EXISTS Item;
DROP TABLE IF EXISTS ItemSearch;

CREATE TABLE Person (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone INTEGER NULL NOT NULL
);

CREATE TABLE Item (
  personEmail VARCHAR(100),
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  postedDate TEXT NOT NULL,
  location VARCHAR(10),
  pictureId VARCHAR(100),
  CONSTRAINT personEmail_Constraint FOREIGN KEY (personEmail) REFERENCES Person(email)
);


INSERT INTO Person (name, email, phone) VALUES ("rob", "rr@gmail.com", 999999);
INSERT INTO Person (name, email, phone) VALUES ("seth", "sz@gmail.com", 888888);

INSERT INTO Item (personEmail, title, description, postedDate, location) VALUES ("rr@gmail.com", "Shoe Black", "A black nike shoe, right, size 9", datetime('now'), "BS28UN");
INSERT INTO Item (personEmail, title, description, postedDate, location) VALUES ("rr@gmail.com", "Shoe Orange", "An orange nike shoe, left, size 9", datetime('now'), "BS28UN");
INSERT INTO Item (personEmail, title, description, postedDate, location) VALUES ("rr@gmail.com", "Shoe Pink", "A pink nike shoe, right, size 9", datetime('now'), "BS28UN");
INSERT INTO Item (personEmail, title, description, postedDate, location) VALUES ("rr@gmail.com", "Shoe White", "A white nike shoe, left, size 9", datetime('now'), "BS28UN");
INSERT INTO Item (personEmail, title, description, postedDate, location) VALUES ("sz@gmail.com", "Mitten", "A red mitten for the right hand", datetime('now'), "BS28UN");

CREATE VIRTUAL TABLE ItemSearch USING fts4 (id, title, description, postedDate, location, pictureId);

INSERT INTO ItemSearch SELECT id, title, description, postedDate, location, pictureId FROM Item;
