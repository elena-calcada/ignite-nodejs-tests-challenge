import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase"

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Create User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to create a new user", async () => {
    const user = await createUserUseCase.execute({
      name: "Name User",
      email: "user@mail.com",
      password: "userpassword",
    });

    expect(user).toHaveProperty("id");
  });

  it("should not be able to create a user that already exists", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "Name User One",
        email: "user@mail.com",
        password: "userpasswordone",
      });

      await createUserUseCase.execute({
        name: "Name User Two",
        email: "user@mail.com",
        password: "userpasswordtwo",
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});

