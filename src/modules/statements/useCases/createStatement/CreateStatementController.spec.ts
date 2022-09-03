import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Create Statement", () => {
  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();

    await connection.close();
  });

  it("should be able to create a new statement", async () => {
    //Create User
    await request(app)
      .post("/api/v1/users")
      .send({
        name: "User Name",
        email: "username@mail.com",
        password: "userpassword",
      });

    //Authenticate User
    const userAthenticated = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "username@mail.com",
        password: "userpassword",
      });

    const { token } = userAthenticated.body;

    //Create Deposit
    const depositResponse = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 500,
        description: "deposit",
      })
      .set({
        Authorization: `Bearer ${token}`
      });

    //Create Withdraw
    const withdrawResponse = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 300,
        description: "withdraw",
      })
      .set({
        Authorization: `Bearer ${token}`
      });

    //Conclusion
    expect(depositResponse.status).toBe(201);
    expect(depositResponse.body).toHaveProperty("id");
    expect(depositResponse.body.amount).toBe(500);
    expect(withdrawResponse.status).toBe(201);
    expect(withdrawResponse.body).toHaveProperty("id");
    expect(withdrawResponse.body.amount).toBe(300);
  });

  it("should not be able to create a statement with ivalid token", async () => {
    const depositResponse = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 500,
        description: "deposit",
      })
      .set({
        Authorization: "ivalid Token"
      });

    expect(depositResponse.status).toBe(401);
    expect(depositResponse.body.message).toEqual("JWT invalid token!")
  });

  it("should not be able to create a statement with token missing", async () => {
    const depositResponse = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 500,
        description: "deposit",
      })

    expect(depositResponse.status).toBe(401);
    expect(depositResponse.body.message).toEqual("JWT token is missing!")
  });

  it("should not be able to add a new witdraw for an user with insufficient funds", async () => {
    //Create User
    await request(app)
      .post("/api/v1/users")
      .send({
        name: "User Name",
        email: "user@mail.com",
        password: "12345",
      });

    //Authenticate User
    const userAthenticated = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "user@mail.com",
        password: "12345",
      });

    const { token } = userAthenticated.body;

    //Create Withdraw
    const withdrawResponse = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 500,
        description: "withdraw",
      })
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(withdrawResponse.status).toBe(400);
    expect(withdrawResponse.body.message).toEqual("Insufficient funds");
  });
});
