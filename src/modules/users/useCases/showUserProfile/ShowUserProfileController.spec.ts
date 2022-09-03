import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("show the authenticated user's profile", () => {
  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();

    await connection.close();
  });

  it("should be able to show the authenticated user's profile by id", async () => {
    await request(app)
      .post("/api/v1/users")
      .send({
        name: "User",
        email: "user@mail.com",
        password: "password",
      });

    const userAthenticated = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "user@mail.com",
        password: "password",
      });

    const { token } = userAthenticated.body;

    const response = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(response.status).toBe(200);
    expect(response.body.email).toEqual("user@mail.com");
    expect(response.body.name).toEqual("User");
  });

  it("should not be able to show the authenticated user's profile with invalid token", async () => {
    const response = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: "Invalid Token"
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toEqual("JWT invalid token!");
  });

  it("should not be able to show the authenticated user's profile with token missing", async () => {
    const response = await request(app)
      .get("/api/v1/profile");

    console.log(response)

    expect(response.status).toBe(401);
    expect(response.body.message).toEqual("JWT token is missing!");
  });
});
