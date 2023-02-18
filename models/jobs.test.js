"use strict";

const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
const db = require("../db.js");
const Job = require("./jobs");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */


describe("create", function () {
    const newJob = {
        title: "stylist",
        salary: 70000,
        equity: "1", // wrapped in ""
        company_handle: "c3"
    }


  test("create job", async function () {
    const job = await Job.create(newJob);
    expect(job).toEqual(newJob);
  });
})


/************************************** findAll */

describe("findAll Jobs", function () {
    test("works: no filter", async function () {
      let jobs = await Job.findAll();
      expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: 'test',
        salary: 20000,
        equity: '1',
        company_handle: 'c3'
      }
      ]);
    });
  });
  
//   /************************************** get */
  
  describe("get", function () {
    test("works", async function () {

        const findjob = await Job.findAll();
        // console.log("FIND JOBB", findjob[0].id)

      let job = await Job.get(findjob[0].id);
      expect(job.equity).toEqual(findjob[0].equity);
      expect(job.salary).toEqual(findjob[0].salary);
      expect(job.title).toEqual(findjob[0].title);
    });
  
    // test("not found if no such company", async function () {
    //   try {
    //     await Job.get("nope");
    //     fail();
    //   } catch (err) {
    //     console.log("ERRRRRRR", err)
    //     expect(err instanceof NotFoundError).toBeTruthy();
    //   }
    // });
  });
  
//   /************************************** update */
  
  describe("update", function () {
    const updateData = {
      title: "New",
      salary: 100,
    };
  
    test("works", async function () {
      const findjob = await Job.findAll();
      let updatejob = await Job.update(findjob[0].id, updateData);
    //   console.log("UPDATE JOBBB", updatejob)
      expect(updatejob).toEqual({
        id: findjob[0].id,
        ...updateData,
        equity: findjob[0].equity, 
        company_handle: findjob[0].company_handle
      });
  
      const result = await db.query(
            `SELECT title, salary, equity, company_handle
             FROM jobs
             WHERE id = ${findjob[0].id}`);
      expect(result.rows).toEqual([{
        title: "New",
        salary: 100,
        equity: findjob[0].equity, 
        company_handle: findjob[0].company_handle
      }]);
    });

  });
  
//   /************************************** remove */
  
  describe("remove", function () {
    test("works", async function () {
      const findjob = await Job.findAll();
      await Job.remove(findjob[0].id);
      const res = await db.query(
          `SELECT id FROM jobs WHERE id=${findjob[0].id}`);
      expect(res.rows.length).toEqual(0);
    });
  
   
  });
  