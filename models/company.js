"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Company {
  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(
          `SELECT handle
           FROM companies
           WHERE handle = $1`,
        [handle]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(
          `INSERT INTO companies
           (handle, name, description, num_employees, logo_url)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`,
        [
          handle,
          name,
          description,
          numEmployees,
          logoUrl,
        ],
    );
    const company = result.rows[0];

    return company;
  }

  /** Find all companies.
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

  static async findAll() {
    const companiesRes = await db.query(
          `SELECT handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl"
           FROM companies
           ORDER BY name`);
    return companiesRes.rows;
  }

  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const companyRes = await db.query(
          `SELECT handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl"
           FROM companies
           WHERE handle = $1`,
        [handle]);

    const company = companyRes.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);


    const jobRes = await db.query(
      `SELECT *
       FROM jobs
       WHERE company_handle = $1`,
    [company.handle]);

    company.job = jobRes.rows

    return company;
  }

  static async filter(filterby){
    const {minEmployees, maxEmployees, nameLike} = filterby;

    let sqlQuery = `SELECT * FROM companies`
    let whereQuery = [] // the array to use to filter the specific query, it will consist of "num_employees" and or "name" followed by the $1,2,3 values 
    let whereVal = [] // the array we will use to represent the $1,2,3 values
  

    if(minEmployees !== undefined){ // if there is a value in minimum employees - AKA its not undefined
      whereVal.push(minEmployees) // we add that value of to the array of wherevalues (this array will be used when the query is put together)
      whereQuery.push(`num_employees > $${whereVal.length}`)// now that there is a value in the whereVal with the min # of employees we want to filter we are assigning that to $1 and looking for companies that have num_employees more than the minEmployees inputted (represented by $1)
      console.log("DEBUGG", whereQuery, whereVal)
    }

    if(maxEmployees !== undefined){ // if there is a value in max employees - AKA its not undefined
      whereVal.push(maxEmployees) // we add that value of the maxEmployees to the array of wherevalues, 
      whereQuery.push(`num_employees < $${whereVal.length}`)// there will now be 2 values in the whereVal so the maxEmployees is represented by $2
    }

    if(nameLike){// if there is a value in nameLike (we want to filter with similar name)
      whereVal.push(`%${nameLike}%`); //pushing the value of the name we are looking for, wrap it around %% to ensure the name we are filtering is included in the search result
      whereQuery.push(`name ILIKE $${whereVal.length}`) // this is the 3rd value so its represented by the $3
    }

    // putting it all together and adjusting sqlQuery to reflect our filters
    if(whereQuery.length > 0){ // if there are values in the whereVal AKA we are adding filters to the search
      sqlQuery +=  " WHERE " + whereQuery.join(" AND ") // making the query SQL friendly, we are adding the "WHERE" to filter and turning the whereQueries into a string and joining with "AND"
      console.log("RESULT STRINGG", sqlQuery,whereVal )
    }

    const filterRes = await db.query(sqlQuery, whereVal);
    return filterRes.rows

  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          numEmployees: "num_employees",
          logoUrl: "logo_url",
        });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE companies 
                      SET ${setCols} 
                      WHERE handle = ${handleVarIdx} 
                      RETURNING handle, 
                                name, 
                                description, 
                                num_employees AS "numEmployees", 
                                logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(
          `DELETE
           FROM companies
           WHERE handle = $1
           RETURNING handle`,
        [handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }
}


module.exports = Company;
