import {
   ALPH_TOKEN_ID,
   Address,
   ContractState,
   DUST_AMOUNT,
   ExecuteScriptParams,
   MINIMAL_CONTRACT_DEPOSIT,
   ONE_ALPH,
   SignerProvider,
   binToHex,
   groupOfAddress,
   number256ToBigint,
   stringToHex,
   subContractId,
   web3,
 } from "@alephium/web3";
 import {
   BidMultipleChoice,
   BoostBet,
   ClaimMultipleChoice,
   DeployBets,
   DeployBetsInstance,
   DeployNewBet,
   DestroyBet,
   EndBet,
   MultipleChoice,
   MultipleChoiceInstance,
   MultipleChoiceTypes,
   PunterChoice,
 } from "../artifacts/ts";
 import { PrivateKeyWallet } from "@alephium/web3-wallet";
 import { testAddress, testPrivateKey } from "@alephium/web3-test";
 import { waitForTxConfirmation as _waitTxConfirmed } from "@alephium/web3";
 
 web3.setCurrentNodeProvider("http://127.0.0.1:22973", undefined, fetch);
 export const ZERO_ADDRESS = "tgx7VNFoP9DJiFMFgXXtafQZkUvyEdDHT9ryamHJYrjq";
 export const defaultSigner = new PrivateKeyWallet({
   privateKey: testPrivateKey,
 });
 
 const isType = <Type>(thing: any): thing is Type => true;
 
 export async function deployBets() {
   const punterTemplateId = await deployPunterMultipleChoiceTemplate();
   const betTemplateId = await deployBetTemplate();
   return await DeployBets.deploy(defaultSigner, {
     initialFields: {
       predictionTemplateId: betTemplateId.contractInstance.contractId,
       punterChoiceTemplateId: punterTemplateId.contractInstance.contractId,
       contractIndex: 0n,
     },
   });
 }
 
 export async function deployBetTemplate() {
   return await MultipleChoice.deploy(defaultSigner, {
     initialFields: {
       punterTemplateId: "00",
       endTimestamp: 0n,
       operator: ZERO_ADDRESS,
       claimedByAnyoneDelay: 0n,
       endBeforeEnd: false,
       title: "",
       choicesName: Array.from(
         Array(10),
         () => "00"
       ) as MultipleChoiceTypes.Fields["choicesName"],
       rewardsComputed: false,
       totalAmountBoost: 0n,
       sideWon: 0n,
       totalAmount: 0n,
       amountPunters: Array.from(
         Array(10),
         () => 0n
       ) as MultipleChoiceTypes.Fields["amountPunters"],
       rewardAmount: 0n,
       rewardBaseCalAmount: 0n,
       counterAttendees: 0n,
       betManager: "",
       contractIndex: 0n,
       tokenIdToVote: "00",
       tokenIdToHodl: "00",
       amountToHodl: 0n,
     },
   });
 }
 
 export async function deployPunterMultipleChoiceTemplate() {
   return await PunterChoice.deploy(defaultSigner, {
     initialFields: {
       predictionContractId: "00",
       punterAddress: ZERO_ADDRESS,
       side: 0n,
       amountBid: 0n,
       claimedByAnyoneAt: 0n,
     },
   });
 }
 
 export async function deployNewBet(
   signer: SignerProvider,
   predict: DeployBetsInstance,
   title: string,
   choicesName: MultipleChoiceTypes.Fields["choicesName"],
   endTimestamp: bigint,
   claimedByAnyoneTimestamp: bigint,
   endBeforeEnd: boolean,
   tokenIdToVote: string,
   tokenIdToHodl: string,
   amountToHodl: bigint
 ) {
   return await DeployNewBet.execute(signer, {
     initialFields: {
       deploy: predict.contractId,
       title: title,
       choicesName: choicesName,
       endTimestamp: endTimestamp,
       claimedByAnyoneTimestamp: claimedByAnyoneTimestamp,
       endBeforeEnd: endBeforeEnd,
       tokenIdToVote: tokenIdToVote,
       tokenIdToHodl: tokenIdToHodl,
       amountToHodl: amountToHodl,
     },
     attoAlphAmount: 1n * ONE_ALPH + DUST_AMOUNT,
   });
 }
 
 export async function bid(
   signer: SignerProvider,
   predict: MultipleChoiceInstance,
   amount: bigint,
   side: bigint,
   tokenIdToHodl: string,
   amountHodl: bigint,
   tokenIdToVote: string
 ) {
   let data = {
     initialFields: {
       predict: predict.contractId,
       amount: amount,
       side: side as bigint,
       tokenIdToHodl: tokenIdToHodl,
       amountHodl: amountHodl,
       tokenIdToVote: tokenIdToVote,
     },
 
     attoAlphAmount: 0n,
     tokens: [{ id: "", amount: 0n }],
   };
 
   if (tokenIdToVote == ALPH_TOKEN_ID && tokenIdToHodl == ALPH_TOKEN_ID) {
     data.attoAlphAmount = amount + 2n * DUST_AMOUNT + amountHodl + MINIMAL_CONTRACT_DEPOSIT;
     data.tokens = [];
   } else if (
     tokenIdToHodl !== ALPH_TOKEN_ID &&
     tokenIdToVote != ALPH_TOKEN_ID
   ) {
     data.attoAlphAmount = MINIMAL_CONTRACT_DEPOSIT + 2n * DUST_AMOUNT;
     data.tokens = [
       {
         id: tokenIdToHodl,
         amount: amountHodl,
       },
       { id: tokenIdToVote, amount: amount },
     ];
   } else if (tokenIdToHodl == ALPH_TOKEN_ID && tokenIdToVote != ALPH_TOKEN_ID) {
     data.attoAlphAmount =
       amountHodl + MINIMAL_CONTRACT_DEPOSIT + 2n * DUST_AMOUNT;
     data.tokens = [
       {
         id: tokenIdToVote,
         amount: amount,
       },
     ];
   } else {
     data.attoAlphAmount = amount + 2n * DUST_AMOUNT;
     data.tokens = [];
   }
 
   if (predict instanceof MultipleChoiceInstance) {
     return await BidMultipleChoice.execute(signer, data);
   }
 }
 
 export async function claim(
   signer: SignerProvider,
   predict: MultipleChoiceInstance,
   addressToClaim: string
 ) {
   return await ClaimMultipleChoice.execute(signer, {
     initialFields: {
       predict: predict.contractId,
       addressToClaim: addressToClaim,
     },
     attoAlphAmount: 10n * DUST_AMOUNT,
   });
 }
 
 export async function destroyBet(
   signer: SignerProvider,
   predict: MultipleChoiceInstance
 ) {
   if (predict instanceof MultipleChoiceInstance) {
     return await DestroyBet.execute(signer, {
       initialFields: {
         bet: predict.contractId,
       },
       attoAlphAmount: DUST_AMOUNT,
     });
   }
 }
 
 export async function endBet(
   signer: SignerProvider,
   bet: MultipleChoiceInstance,
   sideWon: bigint
 ) {
   return await EndBet.execute(signer, {
     initialFields: {
       bet: bet.contractId,
       sideWon: sideWon,
     },
     attoAlphAmount: DUST_AMOUNT,
   });
 }
 
 export async function boostRound(
   signer: SignerProvider,
   predict: MultipleChoiceInstance,
   amount: bigint
 ) {
   if (predict instanceof MultipleChoiceInstance) {
     return await BoostBet.execute(signer, {
       initialFields: {
         predict: predict.contractId,
         amount: amount,
       },
       attoAlphAmount: amount + DUST_AMOUNT,
     });
   }
 }
 
 async function waitTxConfirmed<T extends { txId: string }>(
   promise: Promise<T>
 ): Promise<T> {
   const result = await promise;
   await _waitTxConfirmed(result.txId, 1, 1000);
   return result;
 }
 
 export async function transferAlphTo(to: Address, amount: bigint) {
   return await waitTxConfirmed(
     defaultSigner.signAndSubmitTransferTx({
       signerAddress: testAddress,
       destinations: [{ address: to, attoAlphAmount: amount }],
     })
   );
 }
 
 export async function contractExists(address: string): Promise<boolean> {
   try {
     const nodeProvider = web3.getCurrentNodeProvider();
     await nodeProvider.contracts.getContractsAddressState(address);
     return true;
   } catch (error: any) {
     if (error instanceof Error && error.message.includes("KeyNotFound")) {
       return false;
     }
     throw error;
   }
 }
 
 export function arrayEpochToBytes(arrayEpoch) {
   const buffer = Buffer.alloc(arrayEpoch.length * 4);
   arrayEpoch.forEach((value, index) => buffer.writeUInt32BE(value, index * 4));
   return buffer.toString("hex");
 }
 
 export function fillArray(
   arr: string[],
   targetLength: number,
   fillValue: string
 ) {
   // Create a new array with the provided elements
   const result = arr.map((ele) => stringToHex(ele));
 
   // Calculate the number of elements to fill
   const elementsToFill = targetLength - result.length;
 
   // Fill the remaining elements
   for (let i = 0; i < elementsToFill; i++) {
     result.push(fillValue);
   }
 
   return result as MultipleChoiceTypes.Fields["choicesName"];
 }
 
 export const alphBalanceOf = async (address: string): Promise<bigint> => {
   const balances = await web3
     .getCurrentNodeProvider()
     .addresses.getAddressesAddressBalance(address);
   const balance = balances.balance;
   return balance === undefined ? 0n : BigInt(balance);
 };
 
 export const balanceOf = async (
   tokenId: string,
   address: string
 ): Promise<bigint> => {
   const balances = await web3
     .getCurrentNodeProvider()
     .addresses.getAddressesAddressBalance(address);
   const balance = balances.tokenBalances?.find((t) => t.id === tokenId);
   return balance === undefined ? 0n : BigInt(balance.amount);
 };
 
 export const expectedRewardsBidder = (
   amountBid: bigint,
   rewardAmount: bigint,
   rewardBaseCalAmount: bigint
 ): bigint => {
   return (amountBid * rewardAmount) / rewardBaseCalAmount;
 };