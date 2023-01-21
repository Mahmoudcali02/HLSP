CREATE TABLE `exercises`.`users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(150) NOT NULL,
  `email` VARCHAR(200) NOT NULL,
  `password` VARCHAR(150) NOT NULL,
  PRIMARY KEY (`id`));


-- Stored Procedure
  DELIMITER //
CREATE PROCEDURE signup_and_login(IN email VARCHAR(255), IN username VARCHAR(255), IN password VARCHAR(255))
BEGIN
    DECLARE salt VARCHAR(255);
    DECLARE hashed_password VARCHAR(255);
    
    -- Generate a random salt
    SET salt = SHA2(RAND(), 256);
    
    -- Hash the password with the salt
    SET hashed_password = SHA2(CONCAT(password, salt), 256);
    
    -- Insert the user's details into the "users" table
    INSERT INTO users (email, username, password, salt) 
    VALUES (email, username, hashed_password, salt);
    
    -- Login the user by returning their user ID
    SELECT id FROM users WHERE email = email AND password = hashed_password;
END //
DELIMITER ;



-- CREATE TABLE `heroku_79756038aa8078c`.`users` (
--   `id` INT NOT NULL AUTO_INCREMENT,
--   `username` VARCHAR(150) NOT NULL,
--   `email` VARCHAR(200) NOT NULL,
--   `password` INT NOT NULL,
--   PRIMARY KEY (`id`));


-- CREATE TABLE `heroku_79756038aa8078c`.`workouts` (
--   `id` INT NOT NULL AUTO_INCREMENT,
--   `exercise_name` VARCHAR(50) NOT NULL,
--   `sets` VARCHAR(50) NOT NULL,
--   `reps` VARCHAR(50) NOT NULL,
--   `status` VARCHAR(50) NOT NULL,
--   PRIMARY KEY (`id`));
