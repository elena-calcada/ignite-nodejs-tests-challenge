import { response } from "express";
import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Athenticate User", () => {
  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();

    await connection.close();
  });

  it("should be able authenticate user", async () => {
    await request(app)
      .post("/api/v1/users")
      .send({
        name: "Name User",
        email: "user@mail.com",
        password: "password",
      });

    const userAthenticated = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "user@mail.com",
        password: "password",
      });

    expect(userAthenticated.body).toHaveProperty("token");
  });

  it("should not be able authenticate a user with incorrect email", async () => {
    const user = await request(app)
      .post("/api/v1/users")
      .send({
        name: "User",
        email: "usertest@mail.com",
        password: "password",
      });

    const userAthenticated = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "false@mail.com",
        password: user.body.password,
      });

    expect(userAthenticated.status).toBe(401);
    expect(userAthenticated.body.message).toEqual('Incorrect email or password');
  });

  it("should not be able authenticate user with incorrect password", async () => {
    const user = await request(app)
      .post("/api/v1/users")
      .send({
        name: "User",
        email: "usertest2@mail.com",
        password: "password",
      });

    const userAthenticated = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: user.body.email,
        password: "falsepassword",
      });

    expect(userAthenticated.status).toBe(401);
    expect(userAthenticated.body.message).toEqual('Incorrect email or password');
  });
});
