//auth.js server:
var express = require("express");
var router = express.Router();
const MySql = require("../routes/utils/MySql");
const DButils = require("../routes/utils/DButils");
const bcrypt = require("bcrypt");

// Function to validate username
function validateUsername(username) {
  const usernameRegex = /^[a-zA-Z]{3,8}$/;
  return usernameRegex.test(username);
}

// Function to validate password
function validatePassword(password) {
  const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{5,10}$/;
  return passwordRegex.test(password);
}

// Function to validate email
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isNullOrUndefined(value) {
  return value === null || value === undefined;
}

router.post("/Register", async (req, res, next) => {
  try {
    console.log("Register attempt:", req.body);

    // parameters exists
    const requiredFields = ["username", "firstname", "lastname", "country", "password", "email"];//, "profilePic"];
    for (const field of requiredFields) {
      if (isNullOrUndefined(req.body[field])) {
        throw { status: 400, message: `${field} is required.` };
      }
    }

    // Validate parameters
    if (!validateUsername(req.body.username)) {
      throw { status: 400, message: "Invalid username. It should be between 3 and 8 characters long and contain letters only." };
    }

    if (!validatePassword(req.body.password)) {
      throw { status: 400, message: "Invalid password. It should be between 5 and 10 characters long and contain at least one number and one special character." };
    }

    if (!validateEmail(req.body.email)) {
      throw { status: 400, message: "Invalid email address." };
    }

    let user_details = {
      username: req.body.username,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      country: req.body.country,
      password: req.body.password,
      email: req.body.email,
      // profilePic: req.body.profilePic
    }
    console.log("User details:", user_details);

    let users = [];

    users = await DButils.execQuery("SELECT username from users");
    console.log("Existing users:", users);

    if (users.find((x) => x.username === user_details.username)){
      console.log("Username taken");
      throw { status: 409, message: "Username taken" };
    }
    // add the new username
    let hash_password = bcrypt.hashSync(user_details.password,
      //parseInt(process.env.bcrypt_saltRounds)
      parseInt(8)
    );
    // console.log("Hashed password:", hash_password);


    await DButils.execQuery(
      `INSERT INTO users VALUES ('${user_details.username}', '${user_details.firstname}', '${user_details.lastname}',
      '${user_details.country}', '${hash_password}', '${user_details.email}')`// '${user_details.profilePic}')`
    );
    res.status(201).send({ message: "user created", success: true });
  } catch (error) {
    console.error("Error in Register:", error);
    next(error);
  }
});

router.post("/Login", async (req, res, next) => {
  try {
    // Check for null or undefined inputs
    if (isNullOrUndefined(req.body.username) || isNullOrUndefined(req.body.password)) {
      throw { status: 400, message: "Username and password are required." };
    }

    // Validate parameters
    if (!validateUsername(req.body.username)) {
      throw { status: 400, message: "Invalid username. It should be between 3 and 8 characters long and contain letters only." };
    }

    if (!validatePassword(req.body.password)) {
      throw { status: 400, message: "Invalid password. It should be between 5 and 10 characters long and contain at least one number and one special character." };
    }

    // Check that username exists
    const users = await DButils.execQuery("SELECT username FROM users");
    if (!users.find((x) => x.username === req.body.username)) {
      throw { status: 401, message: "Username or Password incorrect" };
    }

    // Check that the password is correct
    const user = (
      await DButils.execQuery(
        `SELECT * FROM users WHERE username = '${req.body.username}'`
      )
    )[0];

    if (!bcrypt.compareSync(req.body.password, user.password)) {
      throw { status: 401, message: "Username or Password incorrect" };
    }

    // Set cookie
    req.session.username = user.username;
    // Return success response
    res.status(200).send({ message: "Login succeeded", success: true });
  } catch (error) {
    console.error("Error in Login:", error);
    next(error);
  }
});

router.post("/Logout", function (req, res) {
  req.session.reset(); // reset the session info --> send cookie when  req.session == undefined!!
  res.send({ success: true, message: "logout succeeded" });
});

module.exports = router;