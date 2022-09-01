import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe("Authenticate user", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able authenticate an user", async () => {
    const user: ICreateUserDTO = {
      name: "Name User",
      email: "user@mail.com",
      password: "userpassword",
    };

    await createUserUseCase.execute(user);

    const userAutheticated = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });

    expect(userAutheticated).toHaveProperty("token");
  });

  it("should not be able authenticate a user that does not exist", async () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        name: "Name User",
        email: "user@mail.com",
        password: "userpassword",
      }

      await createUserUseCase.execute(user);

      await authenticateUserUseCase.execute({
        email: "false@mail.com",
        password: user.password,
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("should not be able authenticate with incorrect password", async () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        name: "Name User",
        email: "user@mail.com",
        password: "userpassword",
      }

      await createUserUseCase.execute(user);

      await authenticateUserUseCase.execute({
        email: user.email,
        password: "12345",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });


});
