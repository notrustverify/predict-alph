/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  Address,
  Contract,
  ContractState,
  TestContractResult,
  HexString,
  ContractFactory,
  EventSubscribeOptions,
  EventSubscription,
  CallContractParams,
  CallContractResult,
  TestContractParams,
  ContractEvent,
  subscribeContractEvent,
  subscribeContractEvents,
  testMethod,
  callMethod,
  multicallMethods,
  fetchContractState,
  ContractInstance,
  getContractEventsCurrentCount,
} from "@alephium/web3";
import { default as GameContractJson } from "../Game.ral.json";
import { getContractByCodeHash } from "./contracts";

// Custom types for the contract
export namespace GameTypes {
  export type Fields = {
    predictTemplateId: HexString;
    punterTemplateId: HexString;
    roundTemplateId: HexString;
    operator: Address;
    gameCounter: bigint;
  };

  export type State = ContractState<Fields>;

  export type BetBullEvent = ContractEvent<{
    gameId: bigint;
    from: Address;
    epoch: bigint;
    amount: bigint;
    up: boolean;
    claimedByAnyoneTimestamp: bigint;
  }>;
  export type BetBearEvent = ContractEvent<{
    gameId: bigint;
    from: Address;
    epoch: bigint;
    amount: bigint;
    up: boolean;
    claimedByAnyoneTimestamp: bigint;
  }>;
  export type RoundEndedEvent = ContractEvent<{
    gameId: bigint;
    epoch: bigint;
    price: bigint;
  }>;
  export type RoundStartedEvent = ContractEvent<{
    gameId: bigint;
    epoch: bigint;
    price: bigint;
  }>;
  export type ClaimedEvent = ContractEvent<{
    gameId: bigint;
    addressToClaim: Address;
    from: Address;
    epochs: HexString;
  }>;
  export type GameCreatedEvent = ContractEvent<{
    contractId: HexString;
    gameId: bigint;
  }>;

  export interface CallMethodTable {
    getActualGameId: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<bigint>;
    };
  }
  export type CallMethodParams<T extends keyof CallMethodTable> =
    CallMethodTable[T]["params"];
  export type CallMethodResult<T extends keyof CallMethodTable> =
    CallMethodTable[T]["result"];
  export type MultiCallParams = Partial<{
    [Name in keyof CallMethodTable]: CallMethodTable[Name]["params"];
  }>;
  export type MultiCallResults<T extends MultiCallParams> = {
    [MaybeName in keyof T]: MaybeName extends keyof CallMethodTable
      ? CallMethodTable[MaybeName]["result"]
      : undefined;
  };
}

class Factory extends ContractFactory<GameInstance, GameTypes.Fields> {
  getInitialFieldsWithDefaultValues() {
    return this.contract.getInitialFieldsWithDefaultValues() as GameTypes.Fields;
  }

  eventIndex = {
    BetBull: 0,
    BetBear: 1,
    RoundEnded: 2,
    RoundStarted: 3,
    Claimed: 4,
    GameCreated: 5,
  };
  consts = {
    ErrorCodes: {
      InvalidCaller: BigInt(300),
      GameNotExists: BigInt(301),
      GameAlreadyExists: BigInt(302),
    },
    SubContractTypes: { Game: "03" },
  };

  at(address: string): GameInstance {
    return new GameInstance(address);
  }

  tests = {
    getGame: async (
      params: TestContractParams<GameTypes.Fields, { gameId: bigint }>
    ): Promise<TestContractResult<HexString>> => {
      return testMethod(this, "getGame", params);
    },
    getActualGameId: async (
      params: Omit<TestContractParams<GameTypes.Fields, never>, "testArgs">
    ): Promise<TestContractResult<bigint>> => {
      return testMethod(this, "getActualGameId", params);
    },
    createGame: async (
      params: TestContractParams<
        GameTypes.Fields,
        {
          feesBasisPts: bigint;
          repeatEvery: bigint;
          claimedByAnyoneDelay: bigint;
          title: HexString;
        }
      >
    ): Promise<TestContractResult<null>> => {
      return testMethod(this, "createGame", params);
    },
    destroyPredict: async (
      params: TestContractParams<GameTypes.Fields, { gameId: bigint }>
    ): Promise<TestContractResult<null>> => {
      return testMethod(this, "destroyPredict", params);
    },
    destroyRound: async (
      params: TestContractParams<
        GameTypes.Fields,
        { gameId: bigint; epochArray: HexString }
      >
    ): Promise<TestContractResult<null>> => {
      return testMethod(this, "destroyRound", params);
    },
    startRound: async (
      params: TestContractParams<
        GameTypes.Fields,
        { gameId: bigint; price: bigint }
      >
    ): Promise<TestContractResult<null>> => {
      return testMethod(this, "startRound", params);
    },
    endRound: async (
      params: TestContractParams<
        GameTypes.Fields,
        { gameId: bigint; actualPrice: bigint; immediatelyStart: boolean }
      >
    ): Promise<TestContractResult<null>> => {
      return testMethod(this, "endRound", params);
    },
    bid: async (
      params: TestContractParams<
        GameTypes.Fields,
        { gameId: bigint; amount: bigint; up: boolean }
      >
    ): Promise<TestContractResult<null>> => {
      return testMethod(this, "bid", params);
    },
    withdraw: async (
      params: TestContractParams<
        GameTypes.Fields,
        { gameId: bigint; arrayEpochIn: HexString; addressToClaim: Address }
      >
    ): Promise<TestContractResult<null>> => {
      return testMethod(this, "withdraw", params);
    },
    boostRound: async (
      params: TestContractParams<
        GameTypes.Fields,
        { gameId: bigint; amount: bigint; epochToBoost: bigint }
      >
    ): Promise<TestContractResult<null>> => {
      return testMethod(this, "boostRound", params);
    },
    setNewOperator: async (
      params: TestContractParams<GameTypes.Fields, { newOperator: Address }>
    ): Promise<TestContractResult<null>> => {
      return testMethod(this, "setNewOperator", params);
    },
  };
}

// Use this object to test and deploy the contract
export const Game = new Factory(
  Contract.fromJson(
    GameContractJson,
    "",
    "ef614f82d69b46c10d71cd6adf8e21c0e53aaea45e6be46b74b9132e52f67ba8"
  )
);

// Use this class to interact with the blockchain
export class GameInstance extends ContractInstance {
  constructor(address: Address) {
    super(address);
  }

  async fetchState(): Promise<GameTypes.State> {
    return fetchContractState(Game, this);
  }

  async getContractEventsCurrentCount(): Promise<number> {
    return getContractEventsCurrentCount(this.address);
  }

  subscribeBetBullEvent(
    options: EventSubscribeOptions<GameTypes.BetBullEvent>,
    fromCount?: number
  ): EventSubscription {
    return subscribeContractEvent(
      Game.contract,
      this,
      options,
      "BetBull",
      fromCount
    );
  }

  subscribeBetBearEvent(
    options: EventSubscribeOptions<GameTypes.BetBearEvent>,
    fromCount?: number
  ): EventSubscription {
    return subscribeContractEvent(
      Game.contract,
      this,
      options,
      "BetBear",
      fromCount
    );
  }

  subscribeRoundEndedEvent(
    options: EventSubscribeOptions<GameTypes.RoundEndedEvent>,
    fromCount?: number
  ): EventSubscription {
    return subscribeContractEvent(
      Game.contract,
      this,
      options,
      "RoundEnded",
      fromCount
    );
  }

  subscribeRoundStartedEvent(
    options: EventSubscribeOptions<GameTypes.RoundStartedEvent>,
    fromCount?: number
  ): EventSubscription {
    return subscribeContractEvent(
      Game.contract,
      this,
      options,
      "RoundStarted",
      fromCount
    );
  }

  subscribeClaimedEvent(
    options: EventSubscribeOptions<GameTypes.ClaimedEvent>,
    fromCount?: number
  ): EventSubscription {
    return subscribeContractEvent(
      Game.contract,
      this,
      options,
      "Claimed",
      fromCount
    );
  }

  subscribeGameCreatedEvent(
    options: EventSubscribeOptions<GameTypes.GameCreatedEvent>,
    fromCount?: number
  ): EventSubscription {
    return subscribeContractEvent(
      Game.contract,
      this,
      options,
      "GameCreated",
      fromCount
    );
  }

  subscribeAllEvents(
    options: EventSubscribeOptions<
      | GameTypes.BetBullEvent
      | GameTypes.BetBearEvent
      | GameTypes.RoundEndedEvent
      | GameTypes.RoundStartedEvent
      | GameTypes.ClaimedEvent
      | GameTypes.GameCreatedEvent
    >,
    fromCount?: number
  ): EventSubscription {
    return subscribeContractEvents(Game.contract, this, options, fromCount);
  }

  methods = {
    getActualGameId: async (
      params?: GameTypes.CallMethodParams<"getActualGameId">
    ): Promise<GameTypes.CallMethodResult<"getActualGameId">> => {
      return callMethod(
        Game,
        this,
        "getActualGameId",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
  };

  async multicall<Calls extends GameTypes.MultiCallParams>(
    calls: Calls
  ): Promise<GameTypes.MultiCallResults<Calls>> {
    return (await multicallMethods(
      Game,
      this,
      calls,
      getContractByCodeHash
    )) as GameTypes.MultiCallResults<Calls>;
  }
}
