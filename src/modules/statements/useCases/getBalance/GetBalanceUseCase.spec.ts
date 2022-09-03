import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getBalanceUseCase: GetBalanceUseCase;

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
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository);
  });

  it("should be able to get the balance and view of operations", async () => {
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
      description: "Deposit description",
      amount: 1000,
      type: OperationType.DEPOSIT,
    };

    await createStatementUseCase.execute(deposit);

    //Create a Withdraw
    const withdraw: ICreateStatementDTO = {
      user_id: userCreated.id as string,
      description: "Withdraw description",
      amount: 500,
      type: OperationType.WITHDRAW,
    };

    await createStatementUseCase.execute(withdraw);

    //Get Response
    const response = await getBalanceUseCase.execute({ user_id: userCreated.id as string });

    //Conclusion
    expect(response.statement.length).toBe(2);
    expect(response.statement[0].type).toEqual("deposit");
    expect(response.statement[0].amount).toBe(1000);
    expect(response.statement[1].type).toEqual("withdraw");
    expect(response.statement[1].amount).toBe(500);
    expect(response.balance).toBe(500);
  });

  it("should not be able to get balance if user does not exist", async () => {
    expect(async () => {
      await getBalanceUseCase.execute({ user_id: "false_id" });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
