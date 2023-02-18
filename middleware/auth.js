"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");


/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  try {
    // console.log("STARTING authenticateJWT")
    const authHeader = req.headers && req.headers.authorization;
    // console.log("HEADER", authHeader)
    if (authHeader) {
      // console.log("IS IT STORED?", authHeader)
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  try {
    // console.log("WHAT IS IN res.locals.user", res.locals.user)
    if (!res.locals.user) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}

function ensureAdmin(req, res, next){
  try{
    // console.log( "SHOULD BE FALSE", res.locals.user.isAdmin)
    if (!res.locals.user.isAdmin || !res.locals.user){ // there the .user and .isAdmin are falsy AKA no user logged in or user is not admin
      throw new UnauthorizedError() // then we throw an error
    } 
    return next(); //if not we can move onto the route function and create company 
  }
  catch(e){ // catch that error and return it
    return next(e);
  }
}


function ensureRightUserOrAdmin(req, res, next){
  try{
    const userLoggedIn = res.locals.user
    if (!(userLoggedIn && (userLoggedIn.isAdmin == "true" || userLoggedIn.username === req.params.username))){ // if the user is not logged in and user is not an admin or user is not logged in and user is not the user in the request param
      throw new UnauthorizedError() // we throw error
    }
    return next()

  }
  catch(e){
    return next(e)
  }
}

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  ensureRightUserOrAdmin
};
