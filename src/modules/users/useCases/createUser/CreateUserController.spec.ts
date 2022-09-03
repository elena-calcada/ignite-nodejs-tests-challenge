import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import createConnection from "../../../../database/index";

let connection: Connection;

describe("Create User", () => {
  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();

    await connection.close();
  });

  it("should be able to create a new user", async () => {
    const response = await request(app)
      .post("/api/v1/users")
      .send({
        name: "Name User",
        email: "user@mail.com",
        password: "password",
      });

    expect(response.status).toBe(201);
  });

  it("Should not be possible to create a user with email exists", async () => {
    await request(app)
      .post("/api/v1/users")
      .send({
        name: "User One",
        email: "user@mail.com",
        password: "onepassword",
      });

    const userTest = await request(app)
      .post("/api/v1/users")
      .send({
        name: "User Two",
        email: "user@mail.com",
        password: "twopassword",
      });

    expect(userTest.status).toBe(400);
    expect(userTest.body.message).toEqual("User already exists");
  });
});
