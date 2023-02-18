"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError, ExpressError, NotFoundError, UnauthorizedError, ForbiddenError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin} = require("../middleware/auth");
const Company = require("../models/company");

const companyNewSchema = require("../schemas/companyNew.json");
const companyUpdateSchema = require("../schemas/companyUpdate.json");

const router = new express.Router();


/** POST / { company } =>  { company }
 *
 * company should be { handle, name, description, numEmployees, logoUrl }
 *
 * Returns { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: login
 */

router.post("/", ensureAdmin,  async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, companyNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const company = await Company.create(req.body);
    return res.status(201).json({ company });
  } catch (err) {
    return next(err);
  }
});

/** GET /  =>
 *   { companies: [ { handle, name, description, numEmployees, logoUrl }, ...] }
 *
 * Can filter on provided search filters:
 * - minEmployees
 * - maxEmployees
 * - nameLike (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  try {
    const companies = await Company.findAll();

    if(req.body){
      let filterRes = await Company.filter(req.body)
      return res.json(filterRes)
    }


    // // added NAME FILTER 
    // if (req.body.nameLike){  // if there is a value in the nameLike filed in req.body 
    //   let nameFilterLower = (req.body.nameLike).toLowerCase()
    //   let nameLikeRes = companies.filter( c => { return (c.name.toLowerCase()).includes(nameFilterLower)})
    //   // console.log("NAMELIKEE", nameLikeRes)
    //   if (nameLikeRes.length === 0 ){
    //     // console.log("HITTING ERRORR")
    //     throw new ExpressError(`No company with/including name ${req.body.nameLike}`, 404)
    //   }
    //   return res.json(nameLikeRes)
    // }


    // // added RANGE filter
    // if (req.body.maxEmployees && req.body.minEmployees){  // if there is a value in both the minEmployees and maxEmployee field in req.body 
    //   let results = companies.filter(c =>  {return c.numEmployees < req.body.maxEmployees && c.numEmployees > req.body.minEmployees} )
    //   console.log("RANGEE EMPPPPPP", results)

    //   if (typeof req.body.minEmployees !== "number" || typeof req.body.maxEmployees !== "number"){
    //     throw new ExpressError(`Please input a number`, 404)
    //   }

    //   if (req.body.maxEmployees < req.body.minEmployees){
    //     throw new ExpressError(`Minimum number of employees cannot be larger than maximum`, 404)
    //   }  

    //   if (results.length === 0 ){
    //     throw new ExpressError(`No company with employees within range of ${req.body.minEmployees} & ${req.body.maxEmployees}`, 404)
    //   }
      
    //   return res.json(results)
    // }


    // //added MIN EMPLOYEE filter
    // if (req.body.minEmployees){  // if there is a value in the minEmployees filed in req.body 
    //   let minResult = companies.filter(c =>  {return c.numEmployees > req.body.minEmployees} )
    //   console.log("MIN EMPPPPPP", minResult)
      
    //   if (typeof req.body.minEmployees !== "number"){
    //     throw new ExpressError(`Please input a number`, 404)
    //   }
    //   if (minResult.length === 0 ){
    //     throw new ExpressError(`No company with minimum employees of ${req.body.minEmployees}`, 404)
    //   }
    //   return res.json(minResult)
    // }

    // //added MAX EMPLOYEE filter
    // if (req.body.maxEmployees ){  // if there is a value in the minEmployees filed in req.body 
    //   let maxResult = companies.filter(c =>  {return c.numEmployees < req.body.maxEmployees} )
    //   console.log("MAX EMPPPPPP", maxResult)
      
            
    //   if (typeof req.body.maxEmployees !== "number"){
    //     throw new ExpressError(`Please input a number`, 404)
    //   }
    //   if (maxResult.length === 0 ){
    //     throw new ExpressError(`No company with maximum employees of ${req.body.maxResult}`, 404)
    //   }
    //   return res.json(maxResult)
    // }

    return res.json({ companies });
  } catch (err) {
    return next(err);
  }
});

/** GET /[handle]  =>  { company }
 *
 *  Company is { handle, name, description, numEmployees, logoUrl, jobs }
 *   where jobs is [{ id, title, salary, equity }, ...]
 *
 * Authorization required: none
 */

router.get("/:handle", async function (req, res, next) {
  try {
    const company = await Company.get(req.params.handle);
    return res.json({ company });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[handle] { fld1, fld2, ... } => { company }
 *
 * Patches company data.
 *
 * fields can be: { name, description, numEmployees, logo_url }
 *
 * Returns { handle, name, description, numEmployees, logo_url }
 *
 * Authorization required: login
 */

router.patch("/:handle", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, companyUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const company = await Company.update(req.params.handle, req.body);
    return res.json({ company });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[handle]  =>  { deleted: handle }
 *
 * Authorization: login
 */

router.delete("/:handle", ensureAdmin, async function (req, res, next) {
  try {
    await Company.remove(req.params.handle);
    return res.json({ deleted: req.params.handle });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
