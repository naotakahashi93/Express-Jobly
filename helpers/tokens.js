const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

/** return signed JWT from user data. */

function createToken(user) {
  console.assert(user.isAdmin !== undefined, // if the Admin status of the user is not undefined - AKA the user is an admin nothing happens but if this statement is false (AKA user IS NOT an admin then the following message shows)
      "createToken passed user without isAdmin property");

  let payload = { // creating the payload, the username and if the user is admin or not - defaults to not admin 
    username: user.username,
    isAdmin: user.isAdmin || false,
  };

  return jwt.sign(payload, SECRET_KEY);
}

module.exports = { createToken };
