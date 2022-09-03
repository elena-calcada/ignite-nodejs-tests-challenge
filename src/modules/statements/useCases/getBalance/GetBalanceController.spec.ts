import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Get Balance", () => {
  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();

    await connection.close();
  });

  it("should be able to get the balance and view of operations", async () => {
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

    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 500,
        description: "deposit",
      })
      .set({
        Authorization: `Bearer ${token}`
      });

    await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 300,
        description: "withdraw",
      })
      .set({
        Authorization: `Bearer ${token}`
      });

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(response.body.statement.length).toBe(2);
    expect(response.body.statement[0].description).toEqual("deposit");
    expect(response.body.statement[0].amount).toBe(500);
    expect(response.body.statement[1].description).toEqual("withdraw");
    expect(response.body.statement[1].amount).toBe(300);
    expect(response.body).toHaveProperty("balance");
    expect(response.body.balance).toBe(200);
  });

  it("should not be able to get the balance and view of operations with ivalid token", async () => {
    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: "Invalid Token"
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toEqual("JWT invalid token!");
  });

  it("should not be able to get the balance and view of operations with token missing", async () => {
    const response = await request(app)
      .get("/api/v1/statements/balance");

    expect(response.status).toBe(401);
    expect(response.body.message).toEqual("JWT token is missing!");
  });
});
