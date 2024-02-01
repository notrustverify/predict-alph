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
import { default as PredictContractJson } from "../Predict.ral.json";
import { getContractByCodeHash } from "./contracts";

// Custom types for the contract
export namespace PredictTypes {
  export type Fields = {
    gameContract: HexString;
    punterTemplateId: HexString;
    roundTemplateId: HexString;
    title: HexString;
    epoch: bigint;
    operator: Address;
    feesBasisPts: bigint;
    repeatEvery: bigint;
    claimedByAnyoneDelay: bigint;
    playerCounter: bigint;
  };

  export type State = ContractState<Fields>;

  export type BetBullEvent = ContractEvent<{
    from: Address;
    epoch: bigint;
    amount: bigint;
    up: boolean;
    claimedByAnyoneTimestamp: bigint;
  }>;
  export type BetBearEvent = ContractEvent<{
    from: Address;
    epoch: bigint;
    amount: bigint;
    up: boolean;
    claimedByAnyoneTimestamp: bigint;
  }>;
  export type RoundEndedEvent = ContractEvent<{ epoch: bigint; price: bigint }>;
  export type RoundStartedEvent = ContractEvent<{
    epoch: bigint;
    price: bigint;
  }>;
  export type ClaimedEvent = ContractEvent<{
    punterAddress: Address;
    from: Address;
    amount: bigint;
    epoch: bigint;
  }>;

  export interface CallMethodTable {
    getArrayElem: {
      params: CallContractParams<{ array: HexString; index: bigint }>;
      result: CallContractResult<HexString>;
    };
    getTitle: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<HexString>;
    };
    startRound: {
      params: CallContractParams<{ from: Address; price: bigint }>;
      result: CallContractResult<bigint>;
    };
    endRound: {
      params: CallContractParams<{
        from: Address;
        actualPrice: bigint;
        immediatelyStart: boolean;
      }>;
      result: CallContractResult<bigint>;
    };
    bid: {
      params: CallContractParams<{
        amount: bigint;
        up: boolean;
        from: Address;
      }>;
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

class Factory extends ContractFactory<PredictInstance, PredictTypes.Fields> {
  getInitialFieldsWithDefaultValues() {
    return this.contract.getInitialFieldsWithDefaultValues() as PredictTypes.Fields;
  }

  eventIndex = {
    BetBull: 0,
    BetBear: 1,
    RoundEnded: 2,
    RoundStarted: 3,
    Claimed: 4,
  };
  consts = {
    ErrorCodes: {
      PunterNotExists: BigInt(1),
      InvalidPunterAddress: BigInt(2),
      InvalidCaller: BigInt(3),
      BidTimestampReached: BigInt(4),
      RoundAlreadyRunning: BigInt(5),
      RoundDidntEnd: BigInt(6),
      RoundNotExists: BigInt(7),
      AlreadyPlayed: BigInt(8),
      NotEnoughAlph: BigInt(9),
      CannotBeClaimedYet: BigInt(10),
      NotAllPlayerClaimed: BigInt(11),
    },
    SubContractTypes: { Round: "00", Punter: "01" },
  };

  at(address: string): PredictInstance {
    return new PredictInstance(address);
  }

  tests = {
    getArrayElem: async (
      params: TestContractParams<
        PredictTypes.Fields,
        { array: HexString; index: bigint }
      >
    ): Promise<TestContractResult<HexString>> => {
      return testMethod(this, "getArrayElem", params);
    },
    getRoundByEpoch: async (
      params: TestContractParams<PredictTypes.Fields, { epochToGet: bigint }>
    ): Promise<TestContractResult<HexString>> => {
      return testMethod(this, "getRoundByEpoch", params);
    },
    getRoundByEpochByteVec: async (
      params: TestContractParams<PredictTypes.Fields, { epochToGet: HexString }>
    ): Promise<TestContractResult<HexString>> => {
      return testMethod(this, "getRoundByEpochByteVec", params);
    },
    getBetInfoByEpoch: async (
      params: TestContractParams<
        PredictTypes.Fields,
        { from: Address; epochToGet: HexString }
      >
    ): Promise<TestContractResult<HexString>> => {
      return testMethod(this, "getBetInfoByEpoch", params);
    },
    getTitle: async (
      params: Omit<TestContractParams<PredictTypes.Fields, never>, "testArgs">
    ): Promise<TestContractResult<HexString>> => {
      return testMethod(this, "getTitle", params);
    },
    startRound: async (
      params: TestContractParams<
        PredictTypes.Fields,
        { from: Address; price: bigint }
      >
    ): Promise<TestContractResult<bigint>> => {
      return testMethod(this, "startRound", params);
    },
    endRound: async (
      params: TestContractParams<
        PredictTypes.Fields,
        { from: Address; actualPrice: bigint; immediatelyStart: boolean }
      >
    ): Promise<TestContractResult<bigint>> => {
      return testMethod(this, "endRound", params);
    },
    bid: async (
      params: TestContractParams<
        PredictTypes.Fields,
        { amount: bigint; up: boolean; from: Address }
      >
    ): Promise<TestContractResult<bigint>> => {
      return testMethod(this, "bid", params);
    },
    withdraw: async (
      params: TestContractParams<
        PredictTypes.Fields,
        { from: Address; arrayEpochIn: HexString; addressToClaim: Address }
      >
    ): Promise<TestContractResult<null>> => {
      return testMethod(this, "withdraw", params);
    },
    destroyRound: async (
      params: TestContractParams<PredictTypes.Fields, { epochArray: HexString }>
    ): Promise<TestContractResult<null>> => {
      return testMethod(this, "destroyRound", params);
    },
    destroy: async (
      params: Omit<TestContractParams<PredictTypes.Fields, never>, "testArgs">
    ): Promise<TestContractResult<null>> => {
      return testMethod(this, "destroy", params);
    },
    boostRound: async (
      params: TestContractParams<
        PredictTypes.Fields,
        { from: Address; amount: bigint; epochToBoost: bigint }
      >
    ): Promise<TestContractResult<null>> => {
      return testMethod(this, "boostRound", params);
    },
    setNewRepeatEvery: async (
      params: TestContractParams<PredictTypes.Fields, { newRecurrence: bigint }>
    ): Promise<TestContractResult<null>> => {
      return testMethod(this, "setNewRepeatEvery", params);
    },
    setNewFees: async (
      params: TestContractParams<PredictTypes.Fields, { basisPts: bigint }>
    ): Promise<TestContractResult<null>> => {
      return testMethod(this, "setNewFees", params);
    },
    setNewOperator: async (
      params: TestContractParams<PredictTypes.Fields, { newOperator: Address }>
    ): Promise<TestContractResult<null>> => {
      return testMethod(this, "setNewOperator", params);
    },
    setNewClaimedByAnyone: async (
      params: TestContractParams<
        PredictTypes.Fields,
        { newClaimedByAnyoneDelay: bigint }
      >
    ): Promise<TestContractResult<null>> => {
      return testMethod(this, "setNewClaimedByAnyone", params);
    },
  };
}

// Use this object to test and deploy the contract
export const Predict = new Factory(
  Contract.fromJson(
    PredictContractJson,
    "=10-2+54=2-1+8=3-1+9=3-1+a=2-2+11=3-1+7=3-1+3=3-1+f=3-1+4=3-1+6=3-1+8=3-1+a=3-1+c=3-1+d=3-1+f=82-1+e=24+7e0212526f756e6420636f6e747261637420696420001601=25-1+d=18+16017e0212526f756e6420636f6e74726163742069642000=1782",
    "edaf1e6b04edfe3993dbb0046a7b24e8131106aeb7c1cbaa02c8249280a02b47"
  )
);

// Use this class to interact with the blockchain
export class PredictInstance extends ContractInstance {
  constructor(address: Address) {
    super(address);
  }

  async fetchState(): Promise<PredictTypes.State> {
    return fetchContractState(Predict, this);
  }

  async getContractEventsCurrentCount(): Promise<number> {
    return getContractEventsCurrentCount(this.address);
  }

  subscribeBetBullEvent(
    options: EventSubscribeOptions<PredictTypes.BetBullEvent>,
    fromCount?: number
  ): EventSubscription {
    return subscribeContractEvent(
      Predict.contract,
      this,
      options,
      "BetBull",
      fromCount
    );
  }

  subscribeBetBearEvent(
    options: EventSubscribeOptions<PredictTypes.BetBearEvent>,
    fromCount?: number
  ): EventSubscription {
    return subscribeContractEvent(
      Predict.contract,
      this,
      options,
      "BetBear",
      fromCount
    );
  }

  subscribeRoundEndedEvent(
    options: EventSubscribeOptions<PredictTypes.RoundEndedEvent>,
    fromCount?: number
  ): EventSubscription {
    return subscribeContractEvent(
      Predict.contract,
      this,
      options,
      "RoundEnded",
      fromCount
    );
  }

  subscribeRoundStartedEvent(
    options: EventSubscribeOptions<PredictTypes.RoundStartedEvent>,
    fromCount?: number
  ): EventSubscription {
    return subscribeContractEvent(
      Predict.contract,
      this,
      options,
      "RoundStarted",
      fromCount
    );
  }

  subscribeClaimedEvent(
    options: EventSubscribeOptions<PredictTypes.ClaimedEvent>,
    fromCount?: number
  ): EventSubscription {
    return subscribeContractEvent(
      Predict.contract,
      this,
      options,
      "Claimed",
      fromCount
    );
  }

  subscribeAllEvents(
    options: EventSubscribeOptions<
      | PredictTypes.BetBullEvent
      | PredictTypes.BetBearEvent
      | PredictTypes.RoundEndedEvent
      | PredictTypes.RoundStartedEvent
      | PredictTypes.ClaimedEvent
    >,
    fromCount?: number
  ): EventSubscription {
    return subscribeContractEvents(Predict.contract, this, options, fromCount);
  }

  methods = {
    getArrayElem: async (
      params: PredictTypes.CallMethodParams<"getArrayElem">
    ): Promise<PredictTypes.CallMethodResult<"getArrayElem">> => {
      return callMethod(
        Predict,
        this,
        "getArrayElem",
        params,
        getContractByCodeHash
      );
    },
    getTitle: async (
      params?: PredictTypes.CallMethodParams<"getTitle">
    ): Promise<PredictTypes.CallMethodResult<"getTitle">> => {
      return callMethod(
        Predict,
        this,
        "getTitle",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    startRound: async (
      params: PredictTypes.CallMethodParams<"startRound">
    ): Promise<PredictTypes.CallMethodResult<"startRound">> => {
      return callMethod(
        Predict,
        this,
        "startRound",
        params,
        getContractByCodeHash
      );
    },
    endRound: async (
      params: PredictTypes.CallMethodParams<"endRound">
    ): Promise<PredictTypes.CallMethodResult<"endRound">> => {
      return callMethod(
        Predict,
        this,
        "endRound",
        params,
        getContractByCodeHash
      );
    },
    bid: async (
      params: PredictTypes.CallMethodParams<"bid">
    ): Promise<PredictTypes.CallMethodResult<"bid">> => {
      return callMethod(Predict, this, "bid", params, getContractByCodeHash);
    },
  };

  async multicall<Calls extends PredictTypes.MultiCallParams>(
    calls: Calls
  ): Promise<PredictTypes.MultiCallResults<Calls>> {
    return (await multicallMethods(
      Predict,
      this,
      calls,
      getContractByCodeHash
    )) as PredictTypes.MultiCallResults<Calls>;
  }
}
