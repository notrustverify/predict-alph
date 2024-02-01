/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { RunScriptResult, DeployContractExecutionResult } from "@alephium/cli";
import { NetworkId } from "@alephium/web3";
import {
  Punter,
  PunterInstance,
  Round,
  RoundInstance,

  Predict,
  PredictInstance,
  Game,
  GameInstance,
} from ".";
import { default as mainnetDeployments } from "../.deployments.mainnet.json";
import { default as devnetDeployments } from "../.deployments.devnet.json";

export type Deployments = {
  deployerAddress: string;
  contracts: {
    Punter: DeployContractExecutionResult<PunterInstance>;
    Round: DeployContractExecutionResult<RoundInstance>;
    Predict?: DeployContractExecutionResult<PredictInstance>;
    Game?: DeployContractExecutionResult<GameInstance>;
  };
};

function toDeployments(json: any): Deployments {
  const contracts = {
    Punter: {
      ...json.contracts["Punter"],
      contractInstance: Punter.at(
        json.contracts["Punter"].contractInstance.address
      ),
    },
    Round: {
      ...json.contracts["Round"],
      contractInstance: Round.at(
        json.contracts["Round"].contractInstance.address
      ),
    },
    
    Predict:
      json.contracts["Predict"] === undefined
        ? undefined
        : {
            ...json.contracts["Predict"],
            contractInstance: Predict.at(
              json.contracts["Predict"].contractInstance.address
            ),
          },
    Game:
      json.contracts["Game"] === undefined
        ? undefined
        : {
            ...json.contracts["Game"],
            contractInstance: Game.at(
              json.contracts["Game"].contractInstance.address
            ),
          },
  };
  return {
    ...json,
    contracts: contracts as Deployments["contracts"],
  };
}

export function loadDeployments(
  networkId: NetworkId,
  deployerAddress?: string
): Deployments {
  const deployments =
    networkId === "mainnet"
      ? mainnetDeployments
      : networkId === "devnet"
      ? devnetDeployments
      : undefined;
  if (deployments === undefined) {
    throw Error("The contract has not been deployed to the " + networkId);
  }
  const allDeployments = Array.isArray(deployments)
    ? deployments
    : [deployments];
  if (deployerAddress === undefined) {
    if (allDeployments.length > 1) {
      throw Error(
        "The contract has been deployed multiple times on " +
          networkId +
          ", please specify the deployer address"
      );
    } else {
      return toDeployments(allDeployments[0]);
    }
  }
  const result = allDeployments.find(
    (d) => d.deployerAddress === deployerAddress
  );
  if (result === undefined) {
    throw Error("The contract deployment result does not exist");
  }
  return toDeployments(result);
}
