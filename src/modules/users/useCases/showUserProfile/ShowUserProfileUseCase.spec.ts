import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("show the authenticated user's profile", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
  });

  it("should be able to show the authenticated user's profile by id", async () => {
    const user = await createUserUseCase.execute({
      name: "Name",
      email: "mail@mail.com",
      password: "password",
    });

    const userById = await showUserProfileUseCase.execute(user.id as string);

    expect(userById).toEqual(user);
  });

  it("should not be able a user's profile that does not exist", async () => {
    expect(async () => {
      await showUserProfileUseCase.execute("1234");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
})
