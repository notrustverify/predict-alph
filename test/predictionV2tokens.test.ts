import {
  Address,
  addressFromContractId,
  ALPH_TOKEN_ID,
  DUST_AMOUNT,
  groupOfAddress,
  hexToString,
  ONE_ALPH,
  sleep,
  stringToHex,
  subContractId,
  web3,
} from "@alephium/web3";
import {
  expectAssertionError,
  testAddress,
} from "@alephium/web3-test";
import { PrivateKeyWallet } from "@alephium/web3-wallet";
import {
  DeployBets,
  DeployBetsInstance,
  DestroyBet,
  MultipleChoice,
  MultipleChoiceInstance,
  PunterChoice,
} from "../artifacts/ts";
import {
  alphBalanceOf,
  balanceOf,
  bid,
  boostRound,
  claim,
  contractExists,
  deployBets,
  deployNewBet,
  destroyBet,
  endBet,
  expectedRewardsBidder,
  fillArray,
  transferAlphTo,
} from "./utils";
import * as base58 from "bs58";

describe("unit tests", () => {
  // Use the correct host and port
  web3.setCurrentNodeProvider("http://127.0.0.1:22973");

  const groupIndex = groupOfAddress(testAddress);
  const bidDurationSecond = 3n * 1000n;
  jest.setTimeout(3 * 1000 * 60);
  let betsManager: DeployBetsInstance;
  let bet: MultipleChoiceInstance;
  let bidders: PrivateKeyWallet[];
  let operator: PrivateKeyWallet;

  function getSubContractId(parentContractId, path: string) {
    return subContractId(parentContractId, path, groupIndex);
  }

  function getBidderContract(betContractId: string, address: Address) {
    const bidderContractId = getSubContractId(
      betContractId,
      "00" + base58.decode(address).toString("hex")
    );
    const bidderContract = PunterChoice.at(
      addressFromContractId(bidderContractId)
    );
    return bidderContract;
  }

  beforeEach(async () => {
    operator = PrivateKeyWallet.Random(groupIndex);
    betsManager = (await deployBets()).contractInstance;
    bidders = Array.from(Array(5).keys()).map((_) =>
      PrivateKeyWallet.Random(groupIndex)
    );

    for (const bidder of bidders) {
      await transferAlphTo(bidder.address, 100n * ONE_ALPH);
    }

    await transferAlphTo(operator.address, 100n * ONE_ALPH);
  });

  test("create new bet, 3 players, play with token, end", async () => {
    const creator = operator;
    const bidder1 = bidders[0];
    const bidder2 = bidders[1];
    const bidder3 = bidders[2];

    const tokenTest = await mintToken(operator.address, 2000n * 10n ** 9n);
    for (const bidder of bidders) {
      await operator.signAndSubmitTransferTx({
        signerAddress: operator.address,
        destinations: [
          {
            address: bidder.address,
            attoAlphAmount: BigInt(10e16),
            tokens: [
              {
                id: tokenTest.tokenId,
                amount: 20n * 10n ** 9n,
              },
            ],
          },
        ],
      });
    }

    const dateNow = BigInt(Date.now());

    const array = fillArray(["choice1", "choice2"], 10, "00");
    await deployNewBet(
      creator,
      betsManager,
      stringToHex("Bet test"),
      array,
      dateNow + bidDurationSecond,
      dateNow + bidDurationSecond + 30n * 1000n,
      false,
      tokenTest.tokenId,
      ALPH_TOKEN_ID,
      0n
    );

    const betsState = await betsManager.fetchState();
    expect(betsState.fields.contractIndex).toEqual(1n);

    const betCreated = MultipleChoice.at(
      addressFromContractId(getSubContractId(betsManager.contractId, "00"))
    );

    await bid(
      bidder1,
      betCreated,
      10n * 10n ** 9n,
      0n,
      ALPH_TOKEN_ID,
      0n,
      tokenTest.tokenId
    );
    await bid(
      bidder2,
      betCreated,
      12n * 10n ** 9n,
      1n,
      ALPH_TOKEN_ID,
      0n,
      tokenTest.tokenId
    );
    await bid(
      bidder3,
      betCreated,
      5n * 10n ** 9n,
      0n,
      ALPH_TOKEN_ID,
      0n,
      tokenTest.tokenId
    );

    const betStateAfterPlay = await betCreated.fetchState();
    expect(betStateAfterPlay.asset.alphAmount).toEqual(BigInt(1e17));
    expect(betStateAfterPlay.asset.tokens?.length).toEqual(1);
    if (betStateAfterPlay.asset.tokens != undefined)
      expect(betStateAfterPlay.asset.tokens[0].amount).toEqual(27n * 10n ** 9n);

    expect(betStateAfterPlay.fields.totalAmount).toEqual(27n * 10n ** 9n);
    expect(betStateAfterPlay.fields.amountPunters).toEqual([
      15n * 10n ** 9n,
      12n * 10n ** 9n,
      0n,
      0n,
      0n,
      0n,
      0n,
      0n,
      0n,
      0n,
    ]);
    expect(betStateAfterPlay.fields.counterAttendees).toEqual(3n);

    // cannot claim before bet ended
    await expectAssertionError(
      claim(bidder1, betCreated, bidder1.address),
      betCreated.address,
      105
    );

    await sleep(Number(bidDurationSecond));
    await endBet(operator, betCreated, 1n);
    const betStateAfterEnd = await betCreated.fetchState();
    expect(betStateAfterEnd.fields.rewardsComputed).toEqual(true);

    //cannot claim for someone else
    await expectAssertionError(
      claim(bidder1, betCreated, bidder2.address),
      betCreated.address,
      111
    );

    await claim(bidder1, betCreated, bidder1.address);

    const balanceBeforeClaim = await balanceOf(
      tokenTest.tokenId,
      bidder2.address
    );

    const bidder2Contract = getBidderContract(
      betCreated.contractId,
      bidder2.address
    );

    const bidder2State = await bidder2Contract.fetchState();
    await claim(bidder2, betCreated, bidder2.address);
    await claim(bidder3, betCreated, bidder3.address);

    const betStateAfterClaim = await betCreated.fetchState();
    expect(betStateAfterClaim.fields.counterAttendees).toEqual(0n);
    expect(betStateAfterClaim.asset.alphAmount).toEqual(BigInt(1e17));

    expect(bidder2State.asset.alphAmount).toEqual(BigInt(1e17));
    expect(bidder2State.fields.amountBid).toEqual(12n * 10n ** 9n);

    const expectedRewards = expectedRewardsBidder(
      bidder2State.fields.amountBid,
      betStateAfterEnd.fields.rewardAmount,
      betStateAfterEnd.fields.rewardBaseCalAmount
    );
    const balanceAfterClaim = await balanceOf(
      tokenTest.tokenId,
      bidder2.address
    );
    expect(balanceAfterClaim).toEqual(balanceBeforeClaim + expectedRewards);

    await destroyBet(creator, betCreated);

    const exists = await contractExists(betCreated.address);
    expect(exists).toEqual(false);
  });

  test("create new bet, 3 players, play with token, min Hodl other token, end", async () => {
    const creator = operator;
    const bidder1 = bidders[0];
    const bidder2 = bidders[1];
    const bidder3 = bidders[2];
    const bidder4 = bidders[3];

    const tokenTest = await mint(operator.address, 2000n * 10n ** 9n);
    const tokenTestToHodl = await mintToken(
      operator.address,
      2000n * 10n ** 9n
    );

    for (const bidder of bidders) {
      await operator.signAndSubmitTransferTx({
        signerAddress: operator.address,
        destinations: [
          {
            address: bidder.address,
            attoAlphAmount: BigInt(10e16),
            tokens: [
              {
                id: tokenTest.tokenId,
                amount: 20n * 10n ** 9n,
              },
            ],
          },
        ],
      });
    }

    for (const bidder of bidders) {
      await operator.signAndSubmitTransferTx({
        signerAddress: operator.address,
        destinations: [
          {
            address: bidder.address,
            attoAlphAmount: BigInt(10e16),
            tokens: [
              {
                id: tokenTestToHodl.tokenId,
                amount: 20n * 10n ** 9n,
              },
            ],
          },
        ],
      });
    }

    const dateNow = BigInt(Date.now());

    const array = fillArray(["choice1", "choice2"], 10, "00");
    await deployNewBet(
      creator,
      betsManager,
      stringToHex("Bet test"),
      array,
      dateNow + bidDurationSecond,
      dateNow + bidDurationSecond + 30n * 1000n,
      false,
      tokenTest.tokenId,
      tokenTestToHodl.tokenId,
      10n * 10n ** 9n
    );

    const betsState = await betsManager.fetchState();
    expect(betsState.fields.contractIndex).toEqual(1n);

    const betCreated = MultipleChoice.at(
      addressFromContractId(getSubContractId(betsManager.contractId, "00"))
    );

    await expectAssertionError(
      bid(
        bidder4,
        betCreated,
        10n * 10n ** 9n,
        0n,
        tokenTestToHodl.tokenId,
        9n * 10n ** 9n,
        tokenTest.tokenId
      ),
      betCreated.address,
      112
    );
    await bid(
      bidder1,
      betCreated,
      10n * 10n ** 9n,
      0n,
      tokenTestToHodl.tokenId,
      10n * 10n ** 9n,
      tokenTest.tokenId
    );
    await bid(
      bidder2,
      betCreated,
      12n * 10n ** 9n,
      1n,
      tokenTestToHodl.tokenId,
      10n * 10n ** 9n,
      tokenTest.tokenId
    );
    await bid(
      bidder3,
      betCreated,
      5n * 10n ** 9n,
      0n,
      tokenTestToHodl.tokenId,
      10n * 10n ** 9n,
      tokenTest.tokenId
    );

    const betStateAfterPlay = await betCreated.fetchState();
    expect(betStateAfterPlay.asset.alphAmount).toEqual(BigInt(1e17));
    expect(betStateAfterPlay.asset.tokens?.length).toEqual(1);
    if (betStateAfterPlay.asset.tokens != undefined)
      expect(betStateAfterPlay.asset.tokens[0].amount).toEqual(27n * 10n ** 9n);

    expect(betStateAfterPlay.fields.totalAmount).toEqual(27n * 10n ** 9n);
    expect(betStateAfterPlay.fields.amountPunters).toEqual([
      15n * 10n ** 9n,
      12n * 10n ** 9n,
      0n,
      0n,
      0n,
      0n,
      0n,
      0n,
      0n,
      0n,
    ]);
    expect(betStateAfterPlay.fields.counterAttendees).toEqual(3n);

    // cannot claim before bet ended
    await expectAssertionError(
      claim(bidder1, betCreated, bidder1.address),
      betCreated.address,
      105
    );

    await sleep(Number(bidDurationSecond));
    await endBet(operator, betCreated, 1n);
    const betStateAfterEnd = await betCreated.fetchState();
    expect(betStateAfterEnd.fields.rewardsComputed).toEqual(true);

    //cannot claim for someone else
    await expectAssertionError(
      claim(bidder1, betCreated, bidder2.address),
      betCreated.address,
      111
    );

    await claim(bidder1, betCreated, bidder1.address);

    const balanceBeforeClaim = await balanceOf(
      tokenTest.tokenId,
      bidder2.address
    );

    const bidder2Contract = getBidderContract(
      betCreated.contractId,
      bidder2.address
    );

    const bidder2State = await bidder2Contract.fetchState();
    await claim(bidder2, betCreated, bidder2.address);
    await claim(bidder3, betCreated, bidder3.address);

    const betStateAfterClaim = await betCreated.fetchState();
    expect(betStateAfterClaim.fields.counterAttendees).toEqual(0n);
    expect(betStateAfterClaim.asset.alphAmount).toEqual(BigInt(1e17));

    expect(bidder2State.asset.alphAmount).toEqual(BigInt(1e17));
    expect(bidder2State.fields.amountBid).toEqual(12n * 10n ** 9n);

    const expectedRewards = expectedRewardsBidder(
      bidder2State.fields.amountBid,
      betStateAfterEnd.fields.rewardAmount,
      betStateAfterEnd.fields.rewardBaseCalAmount
    );
    const balanceAfterClaim = await balanceOf(
      tokenTest.tokenId,
      bidder2.address
    );
    expect(balanceAfterClaim).toEqual(balanceBeforeClaim + expectedRewards);

    await destroyBet(creator, betCreated);

    const exists = await contractExists(betCreated.address);
    expect(exists).toEqual(false);
  });

  test("create new bet, 3 players, play with token, min ALPH to hold, end", async () => {
    const creator = operator;
    const bidder1 = bidders[0];
    const bidder2 = bidders[1];
    const bidder3 = bidders[2];
    const bidder4 = bidders[3];

    const tokenTest = await mintToken(operator.address, 2000n * 10n ** 9n);

    for (const bidder of bidders) {
      await operator.signAndSubmitTransferTx({
        signerAddress: operator.address,
        destinations: [
          {
            address: bidder.address,
            attoAlphAmount: BigInt(10e16),
            tokens: [
              {
                id: tokenTest.tokenId,
                amount: 20n * 10n ** 9n,
              },
            ],
          },
        ],
      });
    }

    const dateNow = BigInt(Date.now());

    const array = fillArray(["choice1", "choice2"], 10, "00");
    await deployNewBet(
      creator,
      betsManager,
      stringToHex("Bet test"),
      array,
      dateNow + bidDurationSecond,
      dateNow + bidDurationSecond + 30n * 1000n,
      false,
      tokenTest.tokenId,
      ALPH_TOKEN_ID,
      10n * ONE_ALPH
    );

    const betsState = await betsManager.fetchState();
    expect(betsState.fields.contractIndex).toEqual(1n);

    const betCreated = MultipleChoice.at(
      addressFromContractId(getSubContractId(betsManager.contractId, "00"))
    );

    await expectAssertionError(
      bid(
        bidder4,
        betCreated,
        10n * 10n ** 9n,
        0n,
        ALPH_TOKEN_ID,
        9n * ONE_ALPH,
        tokenTest.tokenId
      ),
      betCreated.address,
      112
    );
    await bid(
      bidder1,
      betCreated,
      10n * 10n ** 9n,
      0n,
      ALPH_TOKEN_ID,
      10n * ONE_ALPH,
      tokenTest.tokenId
    );
    await bid(
      bidder2,
      betCreated,
      12n * 10n ** 9n,
      1n,
      ALPH_TOKEN_ID,
      10n * ONE_ALPH,
      tokenTest.tokenId
    );
    await bid(
      bidder3,
      betCreated,
      5n * 10n ** 9n,
      0n,
      ALPH_TOKEN_ID,
      10n * ONE_ALPH,
      tokenTest.tokenId
    );

    const betStateAfterPlay = await betCreated.fetchState();
    expect(betStateAfterPlay.asset.alphAmount).toEqual(BigInt(1e17));
    expect(betStateAfterPlay.asset.tokens?.length).toEqual(1);
    if (betStateAfterPlay.asset.tokens != undefined)
      expect(betStateAfterPlay.asset.tokens[0].amount).toEqual(27n * 10n ** 9n);

    expect(betStateAfterPlay.fields.totalAmount).toEqual(27n * 10n ** 9n);
    expect(betStateAfterPlay.fields.amountPunters).toEqual([
      15n * 10n ** 9n,
      12n * 10n ** 9n,
      0n,
      0n,
      0n,
      0n,
      0n,
      0n,
      0n,
      0n,
    ]);
    expect(betStateAfterPlay.fields.counterAttendees).toEqual(3n);

    // cannot claim before bet ended
    await expectAssertionError(
      claim(bidder1, betCreated, bidder1.address),
      betCreated.address,
      105
    );

    await sleep(Number(bidDurationSecond));
    await endBet(operator, betCreated, 1n);
    const betStateAfterEnd = await betCreated.fetchState();
    expect(betStateAfterEnd.fields.rewardsComputed).toEqual(true);

    //cannot claim for someone else
    await expectAssertionError(
      claim(bidder1, betCreated, bidder2.address),
      betCreated.address,
      111
    );

    await claim(bidder1, betCreated, bidder1.address);

    const balanceBeforeClaim = await balanceOf(
      tokenTest.tokenId,
      bidder2.address
    );

    const bidder2Contract = getBidderContract(
      betCreated.contractId,
      bidder2.address
    );

    const bidder2State = await bidder2Contract.fetchState();
    await claim(bidder2, betCreated, bidder2.address);
    await claim(bidder3, betCreated, bidder3.address);

    const betStateAfterClaim = await betCreated.fetchState();
    expect(betStateAfterClaim.fields.counterAttendees).toEqual(0n);
    expect(betStateAfterClaim.asset.alphAmount).toEqual(BigInt(1e17));

    expect(bidder2State.asset.alphAmount).toEqual(BigInt(1e17));
    expect(bidder2State.fields.amountBid).toEqual(12n * 10n ** 9n);

    const expectedRewards = expectedRewardsBidder(
      bidder2State.fields.amountBid,
      betStateAfterEnd.fields.rewardAmount,
      betStateAfterEnd.fields.rewardBaseCalAmount
    );
    const balanceAfterClaim = await balanceOf(
      tokenTest.tokenId,
      bidder2.address
    );

    expect(balanceAfterClaim).toEqual(balanceBeforeClaim + expectedRewards);

    await destroyBet(creator, betCreated);

    const exists = await contractExists(betCreated.address);
    expect(exists).toEqual(false);
  });

  test("create new bet, 3 players, check amount won", async () => {
    const creator = operator;
    const bidder1 = bidders[0];
    const bidder2 = bidders[1];
    const bidder3 = bidders[2];

    const dateNow = BigInt(Date.now());

    const array = fillArray(["choice1", "choice2"], 10, "00");
    await deployNewBet(
      creator,
      betsManager,
      stringToHex("Bet test"),
      array,
      dateNow + 3000n,
      dateNow + bidDurationSecond + 30n * 1000n,
      false,
      ALPH_TOKEN_ID,
      ALPH_TOKEN_ID,
      0n
    );

    const betsState = await betsManager.fetchState();
    expect(betsState.fields.contractIndex).toEqual(1n);

    const betCreated = MultipleChoice.at(
      addressFromContractId(getSubContractId(betsManager.contractId, "00"))
    );

    await bid(
      bidder1,
      betCreated,
      10n * ONE_ALPH,
      0n,
      ALPH_TOKEN_ID,
      0n,
      ALPH_TOKEN_ID
    );
    await bid(
      bidder2,
      betCreated,
      12n * ONE_ALPH,
      1n,
      ALPH_TOKEN_ID,
      0n,
      ALPH_TOKEN_ID
    );
    await bid(
      bidder3,
      betCreated,
      5n * ONE_ALPH,
      0n,
      ALPH_TOKEN_ID,
      0n,
      ALPH_TOKEN_ID
    );
    const betStateAfterPlay = await betCreated.fetchState();
    expect(betStateAfterPlay.fields.totalAmount).toEqual(
      27n * ONE_ALPH - 3n * BigInt(1e17)
    );
    expect(betStateAfterPlay.asset.alphAmount).toEqual(
      27n * ONE_ALPH - 2n * BigInt(1e17)
    );
    expect(betStateAfterPlay.fields.amountPunters).toEqual([
      15n * ONE_ALPH - 2n * BigInt(1e17),
      12n * ONE_ALPH - BigInt(1e17),
      0n,
      0n,
      0n,
      0n,
      0n,
      0n,
      0n,
      0n,
    ]);
    expect(betStateAfterPlay.fields.counterAttendees).toEqual(3n);

    const bidder1Contract = getBidderContract(
      betCreated.contractId,
      bidder1.address
    );
    const bidder1State = await bidder1Contract.fetchState();
    expect(bidder1State.asset.alphAmount).toEqual(BigInt(1e17));
    expect(bidder1State.fields.amountBid).toEqual(
      10n * ONE_ALPH - BigInt(1e17)
    );

    const bidder2Contract = getBidderContract(
      betCreated.contractId,
      bidder2.address
    );
    const bidder2State = await bidder2Contract.fetchState();
    expect(bidder2State.asset.alphAmount).toEqual(BigInt(1e17));
    expect(bidder2State.fields.amountBid).toEqual(
      12n * ONE_ALPH - BigInt(1e17)
    );

    await sleep(3000);
    await endBet(operator, betCreated, 1n);
    const betStateAfterEnd = await betCreated.fetchState();
    expect(betStateAfterEnd.fields.rewardsComputed).toEqual(true);
    expect(betStateAfterEnd.fields.rewardBaseCalAmount).toEqual(
      bidder2State.fields.amountBid
    );
    expect(betStateAfterEnd.fields.rewardAmount).toEqual(
      27n * ONE_ALPH - 3n * BigInt(1e17)
    );
    expect(betStateAfterEnd.fields.sideWon).toEqual(1n);
    const balanceBeforeClaim = await alphBalanceOf(bidder2.address);

    await claim(bidder1, betCreated, bidder1.address);
    await claim(bidder2, betCreated, bidder2.address);
    const expectedRewards = expectedRewardsBidder(
      bidder2State.fields.amountBid,
      betStateAfterEnd.fields.rewardAmount,
      betStateAfterEnd.fields.rewardBaseCalAmount
    );
    const balanceAfterClaim = await alphBalanceOf(bidder2.address);
    expect(balanceAfterClaim).toBeLessThan(
      balanceBeforeClaim + expectedRewards + BigInt(1e17)
    );
    expect(balanceAfterClaim).toBeGreaterThan(
      Number(balanceBeforeClaim + expectedRewards)
    );

    const exists = await contractExists(bidder1Contract.address);
    expect(exists).toEqual(false);
  });



  test("create new bet, 3 players, boost round, check amount won", async () => {
   const creator = operator;
   const bidder1 = bidders[0];
   const bidder2 = bidders[1];
   const bidder3 = bidders[2];

   const dateNow = BigInt(Date.now());

   const ONE_TOKEN_TEST = 10n**9n
   const tokenTest = await mintToken(operator.address, 20000n * ONE_TOKEN_TEST);
    for (const bidder of bidders) {
      await operator.signAndSubmitTransferTx({
        signerAddress: operator.address,
        destinations: [
          {
            address: bidder.address,
            attoAlphAmount: BigInt(10e16),
            tokens: [
              {
                id: tokenTest.tokenId,
                amount: 200n * ONE_TOKEN_TEST,
              },
            ],
          },
        ],
      });
    }

   const array = fillArray(["choice1", "choice2"], 10, "00");
   await deployNewBet(
     creator,
     betsManager,
     stringToHex("Bet test"),
     array,
     dateNow + 4000n,
     dateNow + bidDurationSecond + 30n * 1000n,
     false,
     tokenTest.tokenId,
     ALPH_TOKEN_ID,
     0n
   );

   const betsState = await betsManager.fetchState();
   expect(betsState.fields.contractIndex).toEqual(1n);

   const betCreated = MultipleChoice.at(
     addressFromContractId(getSubContractId(betsManager.contractId, "00"))
   );

   await bid(
     bidder1,
     betCreated,
     10n * ONE_TOKEN_TEST,
     0n,
     ALPH_TOKEN_ID,
     0n,
     tokenTest.tokenId
   );

   await boostRound(creator, betCreated, 10n*ONE_TOKEN_TEST, tokenTest.tokenId)

   await bid(
     bidder2,
     betCreated,
     12n * ONE_TOKEN_TEST,
     1n,
     ALPH_TOKEN_ID,
     0n,
     tokenTest.tokenId
   );
   await bid(
     bidder3,
     betCreated,
     5n * ONE_TOKEN_TEST,
     0n,
     ALPH_TOKEN_ID,
     0n,
     tokenTest.tokenId
   );
   
   const betStateAfterPlay = await betCreated.fetchState();
   expect(betStateAfterPlay.fields.totalAmount).toEqual(
     37n * ONE_TOKEN_TEST
   );
   expect(betStateAfterPlay.asset.alphAmount).toEqual(
      1n * BigInt(1e17)
   );
   expect(betStateAfterPlay.fields.amountPunters).toEqual([
     15n * ONE_TOKEN_TEST,
     12n * ONE_TOKEN_TEST,
     0n,
     0n,
     0n,
     0n,
     0n,
     0n,
     0n,
     0n,
   ]);
   expect(betStateAfterPlay.fields.counterAttendees).toEqual(3n);

   const bidder1Contract = getBidderContract(
     betCreated.contractId,
     bidder1.address
   );
   const bidder1State = await bidder1Contract.fetchState();
   expect(bidder1State.asset.alphAmount).toEqual(BigInt(1e17));
   expect(bidder1State.fields.amountBid).toEqual(
     10n * ONE_TOKEN_TEST
   );

   const bidder2Contract = getBidderContract(
     betCreated.contractId,
     bidder2.address
   );
   const bidder2State = await bidder2Contract.fetchState();
   expect(bidder2State.asset.alphAmount).toEqual(BigInt(1e17));
   expect(bidder2State.fields.amountBid).toEqual(
     12n * ONE_TOKEN_TEST
   );

   await sleep(3000);
   await endBet(operator, betCreated, 1n);
   const betStateAfterEnd = await betCreated.fetchState();
   expect(betStateAfterEnd.fields.rewardsComputed).toEqual(true);
   expect(betStateAfterEnd.fields.rewardBaseCalAmount).toEqual(
     bidder2State.fields.amountBid
   );
   expect(betStateAfterEnd.fields.rewardAmount).toEqual(
     37n * ONE_TOKEN_TEST
   );
   expect(betStateAfterEnd.asset.alphAmount).toEqual(
      1n * BigInt(1e17)
    );

   
   expect(betStateAfterEnd.fields.sideWon).toEqual(1n);
   const balanceBeforeClaim = await balanceOf(tokenTest.tokenId,bidder2.address);

   await claim(bidder1, betCreated, bidder1.address);
   await claim(bidder2, betCreated, bidder2.address);
   const expectedRewards = expectedRewardsBidder(
     bidder2State.fields.amountBid,
     betStateAfterEnd.fields.rewardAmount,
     betStateAfterEnd.fields.rewardBaseCalAmount
   );
   const balanceAfterClaim = await balanceOf(tokenTest.tokenId,bidder2.address);
   expect(balanceAfterClaim).toEqual(
     balanceBeforeClaim + expectedRewards
   );
   
   const exists = await contractExists(bidder1Contract.address);
   expect(exists).toEqual(false);
 });

});
