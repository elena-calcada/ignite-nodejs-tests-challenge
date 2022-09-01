import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Create Statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  });

  it("should be able to create a new statement", async () => {
    //Create User
    const user: ICreateUserDTO = {
      name: "Name User",
      email: "user@mail.com",
      password: "userpassword",
    }

    const userCreated = await createUserUseCase.execute(user);

    //Create Deposit
    const deposit: ICreateStatementDTO = {
      user_id: userCreated.id as string,
      description: "Deposit description",
      amount: 1000,
      type: OperationType.DEPOSIT,
    };

    const statementDepositCreated = await createStatementUseCase.execute(deposit);

    //Create Withdraw
    const withdraw: ICreateStatementDTO = {
      user_id: userCreated.id as string,
      description: "Withdraw description",
      amount: 500,
      type: OperationType.WITHDRAW,
    };

    const statementWithdrawCreated = await createStatementUseCase.execute(withdraw);

    //Conclusion
    expect(statementDepositCreated).toHaveProperty("id");
    expect(statementDepositCreated.description).toEqual(deposit.description)
    expect(statementWithdrawCreated).toHaveProperty("id");
    expect(statementWithdrawCreated.description).toEqual(withdraw.description)
  });

  it("should not be able to create a statement for a user that does not exist", async () => {
    const deposit: ICreateStatementDTO = {
      user_id: "false id",
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "deposit"
    }

    expect(async () => {
      await createStatementUseCase.execute(deposit);
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("should not be able to add a new witdraw for an user with insufficient funds", async () => {
    const user: ICreateUserDTO = {
      name: "Name User",
      email: "user@mail.com",
      password: "userpassword",
    }

    const userCreated = await createUserUseCase.execute(user);

    const withdraw: ICreateStatementDTO = {
      user_id: userCreated.id as string,
      description: "unauthorized withdrawal",
      amount: 500,
      type: OperationType.WITHDRAW,
    }

    expect(async () => {
      await createStatementUseCase.execute(withdraw);
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
