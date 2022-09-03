import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Get Statement Operation", () => {
  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();

    await connection.close();
  });

  it("shoud be able to get a statement operation", async () => {
    await request(app)
      .post("/api/v1/users")
      .send({
        name: "User Name",
        email: "username@mail.com",
        password: "userpassword",
      });

    const uaserAuthenticated = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "username@mail.com",
        password: "userpassword",
      });

    const { token } = uaserAuthenticated.body;

    const deposit = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 500,
        description: "deposit",
      })
      .set({
        Authorization: `Bearer ${token}`
      });

    const response = await request(app)
      .get(`/api/v1/statements/${deposit.body.id}`)
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(response.body).toHaveProperty("id");
    expect(response.body.amount).toBe("500.00");
    expect(response.body.description).toEqual("deposit");
  });

  it("shoud not be able to get a statement operation with invalid token", async () => {
    const deposit = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 500,
        description: "deposit",
      })
      .set({
        Authorization: "Invalid Token"
      });

    const response = await request(app)
      .get(`/api/v1/statements/${deposit.body.id}`)
      .set({
        Authorization: "Invalid Token"
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toEqual("JWT invalid token!");
  });

  it("shoud not be able to get a statement operation with token missing", async () => {
    const deposit = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 500,
        description: "deposit",
      })
      .set({
        Authorization: "Invalid Token"
      });

    const response = await request(app)
      .get(`/api/v1/statements/${deposit.body.id}`);

    expect(response.status).toBe(401);
    expect(response.body.message).toEqual("JWT token is missing!");
  });

  it("shoud not be able to get a statement operation of an statement that does not exist", async () => {
    await request(app)
      .post("/api/v1/users")
      .send({
        name: "User Name",
        email: "username@mail.com",
        password: "userpassword",
      });

    const uaserAuthenticated = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "username@mail.com",
        password: "userpassword",
      });

    const { token } = uaserAuthenticated.body;

    const faseStatementId = "6149089b-ed9f-4efe-bafd-b238012c9920";

    const response = await request(app)
      .get(`/api/v1/statements/${faseStatementId}`)
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toEqual("Statement not found");
  });
});
