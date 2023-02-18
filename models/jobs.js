"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError, ExpressError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {
  /** Create a job, update db, return new job data.
   *
   * data should be {title, salary, equity, company_handle}
   *
   * Returns { title, salary, equity, company_handle}
   *
   * Throws BadRequestError if job already in database.
   * */

  static async create({title, salary, equity, company_handle}) {

    const result = await db.query(
          `INSERT INTO jobs
           (title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING title, salary, equity, company_handle`,
        [title, salary, equity, company_handle],
    );
    const job = result.rows[0];

    return job;
  }

  /** Find all jobs.
   *
   * Returns [{ title, salary, equity, company_handle }, ...]
   * */

  static async findAll() {
    const jobRes = await db.query(
          `SELECT *
           FROM jobs
           ORDER BY title`);
    return jobRes.rows;
  }

  /** Given a job title, return data about job.
   *
   * Returns {title, salary, equity, company_handle}
   *   where company_handle is [{  handle, name, description, numEmployees, logoUrl }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const jobRes = await db.query(
          `SELECT *
           FROM jobs
           WHERE id = $1`,
        [id]);

    const job = jobRes.rows[0];
        
    if(!job){
        throw new NotFoundError(`No job found with id of ${id}`)

    }

    const companyRes = await db.query(
        `SELECT *
         FROM companies
         WHERE handle = $1`,
      [job.company_handle]);

    delete job.company_handle;
    job.company = companyRes.rows[0]
    
    return job
  }


  static async filter(filterby){
    const {minSalary, hasEquity, title} = filterby;

    let sqlQuery = `SELECT * FROM jobs`
    let whereQuery = [] // the array to use to filter the specific query, it will consist of "salary" or "equity" or "title" followed by the $1,2,3 values 
    let whereVal = [] // the array we will use to represent the contents of the $1,2,3 values
  

    if(minSalary !== undefined){ // if there is a value in minSalary - AKA its not undefined
      whereVal.push(minSalary) // we add that value of to the array of wherevalues (this array will be used when the query is put together)
      whereQuery.push(`salary > $${whereVal.length}`)// now that there is a value in the whereVal with the min salary filter so we are assigning that to $1 and looking for jobs that have a salary more than the minSalary inputted (represented by $1)
    //   console.log("DEBUGG", whereQuery, whereVal)
    }

    if(hasEquity === true){ // if the hasEquity filter is true
      whereQuery.push(`equity > 0`) // hardcoding the query in as we are just trying to find companies with more than 0 equity AKA there is equity
    }

    if(title){// if there is a value in title 
      whereVal.push(`%${title}%`); //pushing the value of the title we are looking for, wrap it around %% to ensure the title we are filtering is included in the search result
      whereQuery.push(`title ILIKE $${whereVal.length}`) // this is the 2nd value so its represented by the $2
    }

    // putting it all together and adjusting sqlQuery to reflect our filters
    if(whereQuery.length > 0){ // if there are values in the whereVal AKA we are adding filters to the search
      sqlQuery +=  " WHERE " + whereQuery.join(" AND ") // making the query SQL friendly, we are adding the "WHERE" to filter and turning the whereQueries into a string and joining with "AND"
    //   console.log("RESULT STRINGG", sqlQuery,whereVal )
    }

    const filterRes = await db.query(sqlQuery, whereVal);
    return filterRes.rows

  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, equity, company_handle}
   *
   * Returns {title, salary, equity, company_handle}
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {});
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING id,
                                title, 
                                salary, 
                                equity, 
                                company_handle`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job with id ${id}`);

    return job;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(id) {
    const result = await db.query(
          `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
        [id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job with id ${id}`);
  }
}


module.exports = Job;
