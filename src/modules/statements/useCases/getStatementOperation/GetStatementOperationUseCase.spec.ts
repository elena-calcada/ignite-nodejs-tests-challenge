import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Get Balance", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
    getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  });

  it("shoud be able to get a statement operation", async () => {
    //Create a User
    const user: ICreateUserDTO = {
      name: "Name User",
      email: "user@mail.com",
      password: "userpassword",
    }

    const userCreated = await createUserUseCase.execute(user);

    //Create a Deposit
    const deposit: ICreateStatementDTO = {
      user_id: userCreated.id as string,
      description: "teste de operação",
      amount: 1000,
      type: OperationType.DEPOSIT,
    };

    const statement = await createStatementUseCase.execute(deposit);

    const response = await getStatementOperationUseCase.execute({
      user_id: userCreated.id as string,
      statement_id: statement.id as string,
    });

    expect(response.amount).toBe(deposit.amount);
    expect(response.description).toBe(deposit.description)
  });

  it("should not be able to get a statement operation if user does not exists", async () => {
    //Create a User
    const user: ICreateUserDTO = {
      name: "Name User",
      email: "user@mail.com",
      password: "userpassword",
    }

    const userCreated = await createUserUseCase.execute(user);

    //Create a Deposit
    const deposit: ICreateStatementDTO = {
      user_id: userCreated.id as string,
      description: "deposit",
      amount: 1000,
      type: OperationType.DEPOSIT,
    };

    const statement = await createStatementUseCase.execute(deposit);

    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: "false_id",
        statement_id: statement.id as string,
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("should not be able to get a statement operation if statement does not exists", async () => {
    //Create a User
    const user: ICreateUserDTO = {
      name: "User",
      email: "user@mail.com",
      password: "password",
    }

    const userCreated = await createUserUseCase.execute(user);

    //Create a Deposit
    const deposit: ICreateStatementDTO = {
      user_id: userCreated.id as string,
      description: "deposit",
      amount: 1000,
      type: OperationType.DEPOSIT,
    };

    const statement = await createStatementUseCase.execute(deposit);

    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: userCreated.id as string,
        statement_id: "false_id",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
