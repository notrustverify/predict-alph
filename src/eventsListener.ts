import { Deployments, waitTxConfirmed } from "@alephium/cli";
import {
  DUST_AMOUNT,
  web3,
  Project,
  NodeProvider,
  SignerProvider,
  Contract,
  ONE_ALPH,
  sleep,
  addressFromContractId,
  EventSubscribeOptions,
} from "@alephium/web3";
import { PrivateKeyWallet } from "@alephium/web3-wallet";
import configuration from "../alephium.config";
import {
  End,
  PredictPrice,
  PredictPriceInstance,
  PredictPriceTypes,
  PredictChoice,
  PredictChoiceTypes,
  Start,
  PredictChoiceInstance,
  PredictMultipleChoiceInstance,
  PredictMultipleChoiceTypes,
  PredictMultipleChoice,
} from "../artifacts/ts";
import * as fetchRetry from "fetch-retry";
import {
  TypeBet,
  contractExists,
  getRoundContractId,
  getRoundContractState,
} from "./utils";
import { Redis } from "ioredis";
import { CoinGeckoClient } from "coingecko-api-v3";
import {
  Address,
  Game,
  Round,
  RoundParticipation,
  connect,
  createAndGetNewAddress,
  createAndGetNewGame,
  createAndGetNewParticipation,
  createAndGetNewRound,
  initDb,
} from "./database/db";
import { Op, Sequelize, where } from "sequelize";
import { exit } from "process";
import { Mutex } from "await-semaphore";
import { release } from "os";
import { error } from "console";

const POLLING_INTERVAL_EVENTS = 60 * 1000;
let typeBet: TypeBet;
var mutex = new Mutex();


async function keyExists(key: string) {
  const reply = await redis.exists(key);
  try {
    if (reply === 1) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function setKeyValue(key: string, value: string) {
  await redis.set(key, value);
}

const optionsPriceBet: EventSubscribeOptions<PredictPriceTypes.BetEvent> = {
  // We specify the pollingInterval as 4 seconds, which will query the contract for new events every 4 seconds
  pollingInterval: POLLING_INTERVAL_EVENTS,
  // The `messageCallback` will be called every time we recive a new event
  messageCallback: async (event: PredictPriceTypes.BetEvent): Promise<void> => {
    //if(BigInt(actualEpoch) == event.fields.epoch){
    console.log(
      `${addressFromContractId(event.fields.contractId)} - Bet(${
        event.fields.from
      }, ${event.fields.amount / ONE_ALPH}, side: ${event.fields.up}, ${
        event.fields.epoch
      }, anyone can claim ${event.fields.claimedByAnyoneTimestamp})`
    );

    const userAddressEvent = event.fields.from;
    const epoch = event.fields.epoch;
    const claimedByAnyone = event.fields.claimedByAnyoneTimestamp;
    const contractId = event.fields.contractId;
    const side = event.fields.up;

    const [gameId] = await createAndGetNewGame(contractId, typeBet);
    const [addrId] = await createAndGetNewAddress(userAddressEvent, gameId);

    let roundId
      await mutex.use(async() => {
     [roundId] = await createAndGetNewRound(
      epoch,
      0,
      false,
      gameId,
      typeBet
    );
   }).catch(err => console.log(`mutex err: ${err}`))
    const [roundParticipation, created] = await createAndGetNewParticipation(
      roundId,
      addrId,
      gameId,
      event.fields.up,
      event.fields.amount,
      false,
      claimedByAnyone,
      typeBet
    );

    if (!created)
      await roundParticipation.update({
        side: side,
        amountBid: event.fields.amount,
        claimedByAnyoneTimestamp: claimedByAnyone,
      });
    //}
    return Promise.resolve();
  },
  // The `errorCallback` will be called when an error occurs, here we unsubscribe the subscription and log the error
  errorCallback: (error, subscription): Promise<void> => {
    console.error(error);
    process.kill(process.pid);

    return Promise.resolve();
  },
};

const optionsChoiceBet: EventSubscribeOptions<PredictChoiceTypes.BetEvent> = {
  // We specify the pollingInterval as 4 seconds, which will query the contract for new events every 4 seconds
  pollingInterval: POLLING_INTERVAL_EVENTS,
  // The `messageCallback` will be called every time we recive a new event
  messageCallback: async (
    event: PredictChoiceTypes.BetEvent
  ): Promise<void> => {
    //if(BigInt(actualEpoch) == event.fields.epoch){
    console.log(
      `${addressFromContractId(event.fields.contractId)} - Bet(${
        event.fields.from
      }, ${event.fields.amount / ONE_ALPH}, side: ${event.fields.side}, ${
        event.fields.epoch
      }, anyone can claim ${event.fields.claimedByAnyoneTimestamp})`
    );

    const userAddressEvent = event.fields.from;
    const epoch = event.fields.epoch;
    const claimedByAnyone = event.fields.claimedByAnyoneTimestamp;
    const contractId = event.fields.contractId;

    const [gameId] = await createAndGetNewGame(contractId, typeBet);
    const [addrId] = await createAndGetNewAddress(userAddressEvent, gameId);

    let roundId
    await mutex.use( async() =>{
    
     [roundId] = await createAndGetNewRound(
      epoch,
      0,
      false,
      gameId,
      typeBet
    );
   } ).catch(err => console.log(`mutex err: ${err}`))

    const [roundParticipation, created] = await createAndGetNewParticipation(
      roundId,
      addrId,
      gameId,
      event.fields.side,
      event.fields.amount,
      false,
      claimedByAnyone,
      typeBet
    );

    if (!created)
      await roundParticipation.update({
        side: event.fields.side,
        amountBid: event.fields.amount,
        claimedByAnyoneTimestamp: claimedByAnyone,
      });
   
    return Promise.resolve();
  },
  // The `errorCallback` will be called when an error occurs, here we unsubscribe the subscription and log the error
  errorCallback: (error, subscription): Promise<void> => {
    console.error(error);
    process.kill(process.pid);

    return Promise.resolve();
  },
};

const optionsMultipleChoiceBet: EventSubscribeOptions<PredictMultipleChoiceTypes.BetEvent> =
  {
    // We specify the pollingInterval as 4 seconds, which will query the contract for new events every 4 seconds
    pollingInterval: POLLING_INTERVAL_EVENTS,
    // The `messageCallback` will be called every time we recive a new event
    messageCallback: async (
      event: PredictMultipleChoiceTypes.BetEvent
    ): Promise<void> => {
      //if(BigInt(actualEpoch) == event.fields.epoch){
      console.log(
        `${addressFromContractId(event.fields.contractId)} - Bet(${
          event.fields.from
        }, ${event.fields.amount / ONE_ALPH}, side: ${event.fields.side}, ${
          event.fields.epoch
        }, anyone can claim ${event.fields.claimedByAnyoneTimestamp})`
      );

      const userAddressEvent = event.fields.from;
      const epoch = event.fields.epoch;
      const claimedByAnyone = event.fields.claimedByAnyoneTimestamp;
      const contractId = event.fields.contractId;

      const [gameId] = await createAndGetNewGame(contractId, typeBet);
      const [addrId] = await createAndGetNewAddress(userAddressEvent, gameId);

      let roundId
     await mutex.use(async() => {
         [roundId] = await createAndGetNewRound(
            epoch,
            0,
            false,
            gameId,
            typeBet
          );
         }).catch(err => {
            console.log(`Mutex error ${err}`)
         })
     
   

      const [roundParticipation, created] = await createAndGetNewParticipation(
        roundId,
        addrId,
        gameId,
        event.fields.side,
        event.fields.amount,
        false,
        claimedByAnyone,
        typeBet
      );

      if (!created)
        await roundParticipation.update({
          sideMultipleChoice: event.fields.side,
          amountBid: event.fields.amount,
          claimedByAnyoneTimestamp: claimedByAnyone,
        });
    
      return Promise.resolve();
    },
    // The `errorCallback` will be called when an error occurs, here we unsubscribe the subscription and log the error
    errorCallback: (error, subscription): Promise<void> => {
      console.error(error);
      process.kill(process.pid);

      return Promise.resolve();
    },
  };

const optionsPriceClaimed: EventSubscribeOptions<PredictPriceTypes.ClaimedEvent> =
  {
    // We specify the pollingInterval as 4 seconds, which will query the contract for new events every 4 seconds
    pollingInterval: POLLING_INTERVAL_EVENTS,
    // The `messageCallback` will be called every time we recive a new event
    messageCallback: async (
      event: PredictPriceTypes.ClaimedEvent
    ): Promise<void> => {
      console.log(
        `${addressFromContractId(event.fields.contractId)} - Claimed(from: ${
          event.fields.from
        }, for: ${event.fields.punterAddress}, ${
          event.fields.amount / ONE_ALPH
        }, ${event.fields.epoch})`
      );

      const userAddressEvent = event.fields.punterAddress;
      const epoch = event.fields.epoch;
      const contractId = event.fields.contractId;

      const [gameId] = await createAndGetNewGame(contractId, typeBet);
      const [addrId] = await createAndGetNewAddress(userAddressEvent, gameId);

      let roundId
      await mutex.use(async() => {
         [roundId] = await createAndGetNewRound(
            epoch,
            0,
            false,
            gameId,
            typeBet
          );
         }).catch(err => {console.log(`Mutex err: ${err}`)})
      
   
      const [roundParticipation, created] = await createAndGetNewParticipation(
        roundId,
        addrId,
        gameId,
        false,
        0n,
        true,
        0n,
        typeBet
      );

      if (!created) await roundParticipation.update({ claimed: true });
  
      return Promise.resolve();
    },
    // The `errorCallback` will be called when an error occurs, here we unsubscribe the subscription and log the error
    errorCallback: (error, subscription): Promise<void> => {
      console.error(error);
      process.kill(process.pid);

      return Promise.resolve();
    },
  };

const optionsChoiceClaimed: EventSubscribeOptions<PredictChoiceTypes.ClaimedEvent> =
  {
    // We specify the pollingInterval as 4 seconds, which will query the contract for new events every 4 seconds
    pollingInterval: POLLING_INTERVAL_EVENTS,
    // The `messageCallback` will be called every time we recive a new event
    messageCallback: async (
      event: PredictChoiceTypes.ClaimedEvent
    ): Promise<void> => {
      console.log(
        `${addressFromContractId(event.fields.contractId)} - Claimed(from: ${
          event.fields.from
        }, for: ${event.fields.punterAddress}, ${
          event.fields.amount / ONE_ALPH
        }, ${event.fields.epoch})`
      );

      const userAddressEvent = event.fields.punterAddress;
      const epoch = event.fields.epoch;
      const contractId = event.fields.contractId;
      
      const [gameId] = await createAndGetNewGame(contractId, typeBet);
      const [addrId] = await createAndGetNewAddress(userAddressEvent, gameId);

      let roundId
      await mutex.use(async() => {

         [roundId] = await createAndGetNewRound(
            epoch,
            0,
            false,
            gameId,
            typeBet
          );
         }).catch(err => console.log(`Mutex err: ${err}`))
     
      

      const [roundParticipation, created] = await createAndGetNewParticipation(
        roundId,
        addrId,
        gameId,
        false,
        0n,
        true,
        0n,
        typeBet
      );

      if (!created) await roundParticipation.update({ claimed: true });

      return Promise.resolve();
    },
    // The `errorCallback` will be called when an error occurs, here we unsubscribe the subscription and log the error
    errorCallback: (error, subscription): Promise<void> => {
      console.error(error);
      process.kill(process.pid);

      return Promise.resolve();
    },
  };

const optionsMultipleChoiceClaimed: EventSubscribeOptions<PredictMultipleChoiceTypes.ClaimedEvent> =
  {
    // We specify the pollingInterval as 4 seconds, which will query the contract for new events every 4 seconds
    pollingInterval: POLLING_INTERVAL_EVENTS,
    // The `messageCallback` will be called every time we recive a new event
    messageCallback: async (
      event: PredictMultipleChoiceTypes.ClaimedEvent
    ): Promise<void> => {
      console.log(
        `${addressFromContractId(event.fields.contractId)} - Claimed(from: ${
          event.fields.from
        }, for: ${event.fields.punterAddress}, ${
          event.fields.amount / ONE_ALPH
        }, ${event.fields.epoch})`
      );

      const userAddressEvent = event.fields.punterAddress;
      const epoch = event.fields.epoch;
      const contractId = event.fields.contractId;

      const [gameId] = await createAndGetNewGame(contractId, typeBet);
      const [addrId] = await createAndGetNewAddress(userAddressEvent, gameId);
   

      let roundId
      await mutex.use(async() => { 
         [roundId] = await createAndGetNewRound(
            epoch,
            0,
            false,
            gameId,
            typeBet
          );
         }).catch(err => console.log(`mutex error: ${err}`))
      const [roundParticipation, created] = await createAndGetNewParticipation(
        roundId,
        addrId,
        gameId,
        false,
        0n,
        true,
        0n,
        typeBet
      );

      if (!created) await roundParticipation.update({ claimed: true });
  

      return Promise.resolve();
    },
    // The `errorCallback` will be called when an error occurs, here we unsubscribe the subscription and log the error
    errorCallback: (error, subscription): Promise<void> => {
      console.error(error);
      process.kill(process.pid);

      return Promise.resolve();
    },
  };

const optionsPriceRoundEnd: EventSubscribeOptions<PredictPriceTypes.RoundEndedEvent> =
  {
    // We specify the pollingInterval as 4 seconds, which will query the contract for new events every 4 seconds
    pollingInterval: POLLING_INTERVAL_EVENTS,
    // The `messageCallback` will be called every time we recive a new event
    messageCallback: async (
      event: PredictPriceTypes.RoundEndedEvent
    ): Promise<void> => {
      console.log(
        `${addressFromContractId(event.fields.contractId)} - Round Ended(${
          event.fields.epoch
        }, ${event.fields.price})`
      );

      const contractId = event.fields.contractId;
      const [gameId] = await createAndGetNewGame(contractId, typeBet);

      await mutex.use(async () => {

      const [round, created] = await Round.findCreateFind({
        where: { epoch: event.fields.epoch, GameId: gameId.id },
        defaults: { priceEnd: event.fields.price, typeBet: typeBet },
      });
      if (!created) await round.update({ priceEnd: event.fields.price });
   } ).catch(err => console.log(`Mutex err: ${err}`))
      return Promise.resolve();
    },
    // The `errorCallback` will be called when an error occurs, here we unsubscribe the subscription and log the error
    errorCallback: (error, subscription): Promise<void> => {
      console.error(error);
      process.kill(process.pid);

      return Promise.resolve();
    },
  };

const optionsChoiceRoundEnd: EventSubscribeOptions<PredictChoiceTypes.RoundEndedEvent> =
  {
    // We specify the pollingInterval as 4 seconds, which will query the contract for new events every 4 seconds
    pollingInterval: POLLING_INTERVAL_EVENTS,
    // The `messageCallback` will be called every time we recive a new event
    messageCallback: async (
      event: PredictChoiceTypes.RoundEndedEvent
    ): Promise<void> => {
      console.log(
        `${addressFromContractId(event.fields.contractId)} - Round Ended(${
          event.fields.epoch
        } - Side Won ${event.fields.sideWon})`
      );
      const contractId = event.fields.contractId;
      const sideWon = event.fields.sideWon;

      const [gameId] = await createAndGetNewGame(contractId, typeBet);

      await mutex.use(async () => {

      const [round, created] = await Round.findCreateFind({
        where: { epoch: event.fields.epoch, GameId: gameId.id },
        defaults: { sideWon: sideWon, typeBet: typeBet },
      });
      if (!created) await round.update({ sideWon: sideWon });
   }).catch(err => console.log(`Mutex err: ${err}`))
      return Promise.resolve();
    },
    // The `errorCallback` will be called when an error occurs, here we unsubscribe the subscription and log the error
    errorCallback: (error, subscription): Promise<void> => {
      console.error(error);
      process.kill(process.pid);

      return Promise.resolve();
    },
  };

const optionsMultipleChoiceRoundEnd: EventSubscribeOptions<PredictMultipleChoiceTypes.RoundEndedEvent> =
  {
    // We specify the pollingInterval as 4 seconds, which will query the contract for new events every 4 seconds
    pollingInterval: POLLING_INTERVAL_EVENTS,
    // The `messageCallback` will be called every time we recive a new event
    messageCallback: async (
      event: PredictMultipleChoiceTypes.RoundEndedEvent
    ): Promise<void> => {
      console.log(
        `${addressFromContractId(event.fields.contractId)} - Round Ended(${
          event.fields.epoch
        } - Side Won ${event.fields.sideWon})`
      );

      const contractId = event.fields.contractId;
      const sideWon = event.fields.sideWon;
      const epoch = Number(event.fields.epoch)

      const [gameId] = await createAndGetNewGame(contractId, typeBet);

      await mutex.use(async () => {
         const [round, created] = await Round.findCreateFind({
            where: { epoch: event.fields.epoch, GameId: gameId.id },
            defaults: { sideWonMultipleChoice: event.fields.sideWon, typeBet: typeBet },
          });
          if (!created) await round.update({ sideWonMultipleChoice: event.fields.sideWon });
      }).catch(err => {
         console.log(`Mutex error: ${err}`)
      })
     
      return Promise.resolve();
    },
    // The `errorCallback` will be called when an error occurs, here we unsubscribe the subscription and log the error
    errorCallback: (error, subscription): Promise<void> => {
      console.error(error);
      process.kill(process.pid);
      return Promise.resolve();
    },
  };

const optionsPriceRoundStart: EventSubscribeOptions<PredictPriceTypes.RoundStartedEvent> =
  {
    // We specify the pollingInterval as 4 seconds, which will query the contract for new events every 4 seconds
    pollingInterval: POLLING_INTERVAL_EVENTS,
    // The `messageCallback` will be called every time we recive a new event
    messageCallback: async (
      event: PredictPriceTypes.RoundEndedEvent
    ): Promise<void> => {
      console.log(
        `${addressFromContractId(event.fields.contractId)} - Round Started(${
          event.fields.epoch
        }, ${event.fields.price})`
      );

      const contractId = event.fields.contractId;
      const [gameId] = await createAndGetNewGame(contractId, typeBet);

      await mutex.use(async() => {

         const [round, created] = await Round.findCreateFind({
            where: { epoch: event.fields.epoch, GameId: gameId.id },
            defaults: { priceStart: event.fields.price, typeBet: typeBet },
          });
          if (!created) await round.update({ priceStart: event.fields.price });
      
         }).catch(err => console.log(`Mutex erro: ${err}`))      

      return Promise.resolve();
    },
    // The `errorCallback` will be called when an error occurs, here we unsubscribe the subscription and log the error
    errorCallback: (error, subscription): Promise<void> => {
      console.error(error);
      process.kill(process.pid);

      return Promise.resolve();
    },
  };

const optionsChoiceRoundStart: EventSubscribeOptions<PredictChoiceTypes.RoundStartedEvent> =
  {
    // We specify the pollingInterval as 4 seconds, which will query the contract for new events every 4 seconds
    pollingInterval: POLLING_INTERVAL_EVENTS,
    // The `messageCallback` will be called every time we recive a new event
    messageCallback: async (
      event: PredictChoiceTypes.RoundStartedEvent
    ): Promise<void> => {
      console.log(
        `${addressFromContractId(event.fields.contractId)} - Round Started(${
          event.fields.epoch
        })`
      );

      const contractId = event.fields.contractId;
      const [gameId] = await createAndGetNewGame(contractId, typeBet);

      await mutex.use(async() => {

      // at start the sideWon is false at start
      const [round, created] = await Round.findCreateFind({
        where: { epoch: event.fields.epoch, GameId: gameId.id },
        defaults: { sideWon: false, typeBet: typeBet },
      });
      //if (!created) await round.update({ sideWon: false });
   }).catch(err => console.log(`Mutex err: ${err}`))
      return Promise.resolve();
    },
    // The `errorCallback` will be called when an error occurs, here we unsubscribe the subscription and log the error
    errorCallback: (error, subscription): Promise<void> => {
      console.error(error);
      process.kill(process.pid);

      return Promise.resolve();
    },
  };

const optionsMultipleChoiceRoundStart: EventSubscribeOptions<PredictMultipleChoiceTypes.RoundStartedEvent> =
  {
    // We specify the pollingInterval as 4 seconds, which will query the contract for new events every 4 seconds
    pollingInterval: POLLING_INTERVAL_EVENTS,
    // The `messageCallback` will be called every time we recive a new event
    messageCallback: async (
      event: PredictMultipleChoiceTypes.RoundStartedEvent
    ): Promise<void> => {
      console.log(
        `${addressFromContractId(event.fields.contractId)} - Round Started(${
          event.fields.epoch
        })`
      );

      const contractId = event.fields.contractId;
      const epoch = Number(event.fields.epoch);
      const [gameId] = await createAndGetNewGame(contractId, typeBet);

      await mutex.use(async () =>{

      // at start the sideWon is false at start
      const [round, created] = await Round.findCreateFind({
        where: { epoch: epoch, GameId: gameId.id },
        defaults: { typeBet: typeBet },
      });
      if (!created) await round.update({ typeBet: typeBet});
   }).catch(err => `Muter error: ${error}`)
      return Promise.resolve();
    },
    // The `errorCallback` will be called when an error occurs, here we unsubscribe the subscription and log the error
    errorCallback: (error, subscription): Promise<void> => {
      console.error(error);
      process.kill(process.pid);

      return Promise.resolve();
    },
  };

async function listenerManager(
  privKey: string,
  contractName: string,
  sequelize: Sequelize
) {
  const wallet = new PrivateKeyWallet({
    privateKey: privKey,
    keyType: undefined,
    nodeProvider: web3.getCurrentNodeProvider(),
  });

  //.deployments contains the info of our `TokenFaucet` deployement, as we need to now the contractId and address
  //This was auto-generated with the `cli deploy` of our `scripts/0_deploy_faucet.ts`
  const deployments = await Deployments.from(
    `./artifacts/.deployments.${networkToUse}.json`
  );
  //Make sure it match your address group
  const group = wallet.group;
  const deployed = deployments.getDeployedContractResult(group, contractName);

  const contractType = contractName.split(":")[0].toLowerCase();

  const predictalphInstance = deployed.contractInstance;
  const predictalphContractId = deployed.contractInstance.contractId;
  const predictalphContractAddress = deployed.contractInstance.address;
  let predictalphDeployed:
    | PredictChoiceInstance
    | PredictPriceInstance
    | PredictMultipleChoiceInstance;

  if (contractType == "predictprice")
    predictalphDeployed = PredictPrice.at(predictalphContractAddress);
  else if (contractType == "predictchoice")
    predictalphDeployed = PredictChoice.at(predictalphContractAddress);
  else if (contractType == "predictmultiplechoice")
    predictalphDeployed = PredictMultipleChoice.at(predictalphContractAddress);
  else {
    console.error(`Contract type ${contractType} not found`);
    return;
  }
  console.log(contractType);

  const redisContractKeyName = `contractid:${contractName}`;
  const KEY_NAME_COUNTER_EVENT = `eventsCounter:${contractName}`;

  const contractIdKeyExists = await keyExists(redisContractKeyName);
  if (contractIdKeyExists) {
    const contractId = await redis.get(redisContractKeyName);

    if (contractId != predictalphContractId) {
      console.log("Contract changed, flush db");
      await redis.set(KEY_NAME_COUNTER_EVENT, 0);
      // await redis.flushdb();
      //initDb(sequelize, true);
    }
  }

  const contractEventsCounter =
    await predictalphDeployed.getContractEventsCurrentCount();
  let eventCounterSaved = Number(await redis.get(KEY_NAME_COUNTER_EVENT));

  setKeyValue(redisContractKeyName, predictalphContractId);

  let subscriptionRoundStart;
  let subscriptionRoundEnd;
  let subscriptionBet;
  let subscriptionClaimed;

  if (predictalphDeployed instanceof PredictPriceInstance) {
    typeBet = TypeBet.price;

    subscriptionRoundStart = predictalphDeployed.subscribeRoundStartedEvent(
      optionsPriceRoundStart,
      eventCounterSaved
    );

    subscriptionBet = predictalphDeployed.subscribeBetEvent(
      optionsPriceBet,
      eventCounterSaved
    );

    subscriptionRoundEnd = predictalphDeployed.subscribeRoundEndedEvent(
      optionsPriceRoundEnd,
      eventCounterSaved
    );

    subscriptionClaimed = predictalphDeployed.subscribeClaimedEvent(
      optionsPriceClaimed,
      eventCounterSaved
    );
  } else if (predictalphDeployed instanceof PredictChoiceInstance) {
    typeBet = TypeBet.choice;

    subscriptionRoundStart = predictalphDeployed.subscribeRoundStartedEvent(
      optionsChoiceRoundStart,
      eventCounterSaved
    );

    subscriptionBet = predictalphDeployed.subscribeBetEvent(
      optionsChoiceBet,
      eventCounterSaved
    );

    subscriptionRoundEnd = predictalphDeployed.subscribeRoundEndedEvent(
      optionsChoiceRoundEnd,
      eventCounterSaved
    );

    subscriptionClaimed = predictalphDeployed.subscribeClaimedEvent(
      optionsChoiceClaimed,
      eventCounterSaved
    );
  } else if (predictalphDeployed instanceof PredictMultipleChoiceInstance) {
    typeBet = TypeBet.mutipleChoice;

    subscriptionRoundStart = predictalphDeployed.subscribeRoundStartedEvent(
      optionsMultipleChoiceRoundStart,
      eventCounterSaved
    );

    subscriptionBet = predictalphDeployed.subscribeBetEvent(
      optionsMultipleChoiceBet,
      eventCounterSaved
    );

    subscriptionRoundEnd = predictalphDeployed.subscribeRoundEndedEvent(
      optionsMultipleChoiceRoundEnd,
      eventCounterSaved
    );

    subscriptionClaimed = predictalphDeployed.subscribeClaimedEvent(
      optionsMultipleChoiceClaimed,
      eventCounterSaved
    );
  }

  console.log(
    `Events from contract ${contractEventsCounter}, number of events seen ${eventCounterSaved}`
  );

  setKeyValue(KEY_NAME_COUNTER_EVENT, contractEventsCounter.toString());


}

const retryFetch = fetchRetry.default(fetch, {
  retries: 10,
  retryDelay: 1000,
});

let networkToUse = process.argv.slice(2)[0];
//Select our network defined in alephium.config.ts
let contractName = process.argv.slice(2)[1];

//NodeProvider is an abstraction of a connection to the Alephium network
const nodeProvider = new NodeProvider(
  configuration.networks[networkToUse].nodeUrl,
  undefined,
  retryFetch
);

//Sometimes, it's convenient to setup a global NodeProvider for your project:
web3.setCurrentNodeProvider(nodeProvider);

const redis = new Redis({ host: process.env.REDIS_HOST ?? "127.0.0.1" });
const sequelize = connect(
  process.env.DB_PATH === undefined
    ? "/data/roundsData.sqlite"
    : process.env.DB_PATH
);

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((error) => {
    console.error("Unable to connect to the database: ", error);
  });

listenerManager(
  configuration.networks[networkToUse].privateKeys[0],
  contractName,
  sequelize
);

console.log("done");
