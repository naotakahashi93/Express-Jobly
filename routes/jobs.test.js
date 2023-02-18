"use strict";

const request = require("supertest");

const db = require("../db.js");
const app = require("../app");
const Job = require("../models/jobs");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u22Token,
  testJobId,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
    const newJob = {
      title: "newJ",
      salary: 300,
      equity: "1",
      company_handle: "c3"
    };
  
    test("ok for users", async function () {
      const resp = await request(app)
          .post("/jobs")
          .send(newJob)
          .set("authorization", `Bearer ${u22Token}`);
      expect(resp.statusCode).toEqual(201);
      expect(resp.body).toEqual({
        job: newJob
      });
    });
  
    test("bad request with missing data", async function () {
      const resp = await request(app)
          .post("/jobs")
          .send({
            title: "newnewJ",
            salary: 300,
          })
          .set("authorization", `Bearer ${u22Token}`);
      expect(resp.statusCode).toEqual(400);
    });
  
    test("bad request with invalid data", async function () {
      const resp = await request(app)
          .post("/jobs")
          .send({
            title: "newJ",
            salary: "NOT A NUMBER",
            equity: "1",
            company_handle: "c3"
          })
          .set("authorization", `Bearer ${u22Token}`);
      expect(resp.statusCode).toEqual(400);
    });
  });
  
  /************************************** GET /jobs */
  
  describe("GET /companies", function () {
    test("ok for anon", async function () {
      const resp = await request(app).get("/jobs");
      expect(resp.body).toEqual(
            [{
              id: expect.any(Number),
              title: "testJob", 
              salary: 10000, 
              equity: "1", 
              company_handle: "c3"
            }]
      );
    },
    
    test("filter test", async function(){ // ADDED TEST FOR FILTER
      const resp = await request(app).get("/jobs")
      .send({
        minSalary: 900
      })
      expect(resp.body).toEqual(
        
          [{ 
            id: expect.any(Number),
            title: "testJob", 
          salary: 10000, 
          equity: "1", 
          company_handle: "c3"
        }]
      )
    })
    
    );
  
  });
  
//   /************************************** GET /jobs/:handle */
  
  describe("GET /jobs/:id",  function () {
    test("works for anon", async function () {
    console.log("SHOULD MATCHHHH", testJobId)
      const resp = await request(app).get(`/jobs/${testJobId[0]}`);
      expect(resp.body.job.title).toEqual("testJob");
      expect(resp.body.job.salary).toEqual(10000);
      expect(resp.body.job.equity).toEqual("1");
    });

    test("not found ", async function () {
      const resp = await request(app).get(`/jobs/nope`);
      expect(resp.statusCode).toEqual(500);
    });
  });
  
//   /************************************** PATCH /jobs/:handle */
  
  describe("PATCH /jobs/:id", function () {
    test("works for users", async function () {
      const resp = await request(app)
          .patch(`/jobs/${testJobId[0]}`)
          .send({
            title: "NEWJOBTITLE",
            company_handle: "c2"
          })
          .set("authorization", `Bearer ${u22Token}`);
      expect(resp.body).toEqual({
            job: {
                id: expect.any(Number),
                title: 'NEWJOBTITLE',
                salary: 10000,
                equity: '1',
                company_handle: 'c2'
              }

      });
    });
  
    test("unauth for anon", async function () {
      const resp = await request(app)
          .patch(`/jobs/${testJobId[0]}`)
          .send({
            name: "new",
          });
      expect(resp.statusCode).toEqual(500);
    });

  
  });
  
//   /************************************** DELETE /jobs/:handle */
  
  describe("DELETE /companies/:handle", function () {
    test("works for users", async function () {
      const resp = await request(app)
          .delete(`/jobs/${testJobId[0]}`)
          .set("authorization", `Bearer ${u22Token}`);
      expect(resp.body).toEqual({ deleted: `${testJobId[0]}` });
    });
  

  });
  