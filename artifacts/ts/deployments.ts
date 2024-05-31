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
  RoundChoice,
  RoundChoiceInstance,
  PredictPrice,
  PredictPriceInstance,
  PredictChoice,
  PredictChoiceInstance,
  PunterChoice,
  PunterChoiceInstance,
  RoundMultipleChoice,
  RoundMultipleChoiceInstance,
  PredictMultipleChoice,
  PredictMultipleChoiceInstance,
} from ".";
import { default as mainnetDeployments } from "../.deployments.mainnet.json";
import { default as testnetDeployments } from "../.deployments.testnet.json";
import { default as devnetDeployments } from "../.deployments.devnet.json";

export type Deployments = {
  deployerAddress: string;
  contracts: {
    Punter: DeployContractExecutionResult<PunterInstance>;
    Round: DeployContractExecutionResult<RoundInstance>;
    RoundChoice: DeployContractExecutionResult<RoundChoiceInstance>;
    PredictPrice_PredictPriceALPH: DeployContractExecutionResult<PredictPriceInstance>;
    PredictPrice_PredictPriceBTC: DeployContractExecutionResult<PredictPriceInstance>;
    PunterChoice: DeployContractExecutionResult<PunterChoiceInstance>;
    RoundMultipleChoice: DeployContractExecutionResult<RoundMultipleChoiceInstance>;
    PredictChoice_PredictChoiceRhone?: DeployContractExecutionResult<PredictChoiceInstance>;
    PredictChoice_PredictChoiceALPHFour?: DeployContractExecutionResult<PredictChoiceInstance>;
    PredictChoice_PredictChoiceRhoneQ2?: DeployContractExecutionResult<PredictChoiceInstance>;
    PredictChoice_PredictChoiceALPHTop100?: DeployContractExecutionResult<PredictChoiceInstance>;
    PredictChoice_PredictChoiceNGUTOP?: DeployContractExecutionResult<PredictChoiceInstance>;
    PredictChoice_PredictChoiceBTC100K?: DeployContractExecutionResult<PredictChoiceInstance>;
    PredictMultipleChoice_PredictMultipleChoiceTest?: DeployContractExecutionResult<PredictMultipleChoiceInstance>;
    PredictMultipleChoice_PredictMultipleChoiceUEFASemi?: DeployContractExecutionResult<PredictMultipleChoiceInstance>;
    PredictMultipleChoice_PredictMultipleChoiceRealBorussia?: DeployContractExecutionResult<PredictMultipleChoiceInstance>;
    PredictMultipleChoice_PredictMultipleChoiceNBADallasBoston?: DeployContractExecutionResult<PredictMultipleChoiceInstance>;
    PredictMultipleChoice_PredictMultipleChoiceNBAKnick76ers?: DeployContractExecutionResult<PredictMultipleChoiceInstance>;
    PredictMultipleChoice_PredictChoiceNGUTOP?: DeployContractExecutionResult<PredictMultipleChoiceInstance>;
    PredictMultipleChoice_PredictMultipleChoiceNGUTOP?: DeployContractExecutionResult<PredictMultipleChoiceInstance>;
    PredictMultipleChoice_PredictMultipleChoiceEuroFRCH?: DeployContractExecutionResult<PredictMultipleChoiceInstance>;
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
    RoundChoice: {
      ...json.contracts["RoundChoice"],
      contractInstance: RoundChoice.at(
        json.contracts["RoundChoice"].contractInstance.address
      ),
    },
    PredictPrice_PredictPriceALPH: {
      ...json.contracts["PredictPrice:PredictPriceALPH"],
      contractInstance: PredictPrice.at(
        json.contracts["PredictPrice:PredictPriceALPH"].contractInstance.address
      ),
    },
    PredictPrice_PredictPriceBTC: {
      ...json.contracts["PredictPrice:PredictPriceBTC"],
      contractInstance: PredictPrice.at(
        json.contracts["PredictPrice:PredictPriceBTC"].contractInstance.address
      ),
    },
    PunterChoice: {
      ...json.contracts["PunterChoice"],
      contractInstance: PunterChoice.at(
        json.contracts["PunterChoice"].contractInstance.address
      ),
    },
    RoundMultipleChoice: {
      ...json.contracts["RoundMultipleChoice"],
      contractInstance: RoundMultipleChoice.at(
        json.contracts["RoundMultipleChoice"].contractInstance.address
      ),
    },
    PredictChoice_PredictChoiceRhone:
      json.contracts["PredictChoice:PredictChoiceRhone"] === undefined
        ? undefined
        : {
            ...json.contracts["PredictChoice:PredictChoiceRhone"],
            contractInstance: PredictChoice.at(
              json.contracts["PredictChoice:PredictChoiceRhone"]
                .contractInstance.address
            ),
          },
    PredictChoice_PredictChoiceALPHFour:
      json.contracts["PredictChoice:PredictChoiceALPHFour"] === undefined
        ? undefined
        : {
            ...json.contracts["PredictChoice:PredictChoiceALPHFour"],
            contractInstance: PredictChoice.at(
              json.contracts["PredictChoice:PredictChoiceALPHFour"]
                .contractInstance.address
            ),
          },
    PredictChoice_PredictChoiceRhoneQ2:
      json.contracts["PredictChoice:PredictChoiceRhoneQ2"] === undefined
        ? undefined
        : {
            ...json.contracts["PredictChoice:PredictChoiceRhoneQ2"],
            contractInstance: PredictChoice.at(
              json.contracts["PredictChoice:PredictChoiceRhoneQ2"]
                .contractInstance.address
            ),
          },
    PredictChoice_PredictChoiceALPHTop100:
      json.contracts["PredictChoice:PredictChoiceALPHTop100"] === undefined
        ? undefined
        : {
            ...json.contracts["PredictChoice:PredictChoiceALPHTop100"],
            contractInstance: PredictChoice.at(
              json.contracts["PredictChoice:PredictChoiceALPHTop100"]
                .contractInstance.address
            ),
          },
    PredictChoice_PredictChoiceNGUTOP:
      json.contracts["PredictChoice:PredictChoiceNGUTOP"] === undefined
        ? undefined
        : {
            ...json.contracts["PredictChoice:PredictChoiceNGUTOP"],
            contractInstance: PredictChoice.at(
              json.contracts["PredictChoice:PredictChoiceNGUTOP"]
                .contractInstance.address
            ),
          },
    PredictChoice_PredictChoiceBTC100K:
      json.contracts["PredictChoice:PredictChoiceBTC100K"] === undefined
        ? undefined
        : {
            ...json.contracts["PredictChoice:PredictChoiceBTC100K"],
            contractInstance: PredictChoice.at(
              json.contracts["PredictChoice:PredictChoiceBTC100K"]
                .contractInstance.address
            ),
          },
    PredictMultipleChoice_PredictMultipleChoiceTest:
      json.contracts["PredictMultipleChoice:PredictMultipleChoiceTest"] ===
      undefined
        ? undefined
        : {
            ...json.contracts[
              "PredictMultipleChoice:PredictMultipleChoiceTest"
            ],
            contractInstance: PredictMultipleChoice.at(
              json.contracts["PredictMultipleChoice:PredictMultipleChoiceTest"]
                .contractInstance.address
            ),
          },
    PredictMultipleChoice_PredictMultipleChoiceUEFASemi:
      json.contracts["PredictMultipleChoice:PredictMultipleChoiceUEFASemi"] ===
      undefined
        ? undefined
        : {
            ...json.contracts[
              "PredictMultipleChoice:PredictMultipleChoiceUEFASemi"
            ],
            contractInstance: PredictMultipleChoice.at(
              json.contracts[
                "PredictMultipleChoice:PredictMultipleChoiceUEFASemi"
              ].contractInstance.address
            ),
          },
    PredictMultipleChoice_PredictMultipleChoiceRealBorussia:
      json.contracts[
        "PredictMultipleChoice:PredictMultipleChoiceRealBorussia"
      ] === undefined
        ? undefined
        : {
            ...json.contracts[
              "PredictMultipleChoice:PredictMultipleChoiceRealBorussia"
            ],
            contractInstance: PredictMultipleChoice.at(
              json.contracts[
                "PredictMultipleChoice:PredictMultipleChoiceRealBorussia"
              ].contractInstance.address
            ),
          },
    PredictMultipleChoice_PredictMultipleChoiceNBADallasBoston:
      json.contracts[
        "PredictMultipleChoice:PredictMultipleChoiceNBADallasBoston"
      ] === undefined
        ? undefined
        : {
            ...json.contracts[
              "PredictMultipleChoice:PredictMultipleChoiceNBADallasBoston"
            ],
            contractInstance: PredictMultipleChoice.at(
              json.contracts[
                "PredictMultipleChoice:PredictMultipleChoiceNBADallasBoston"
              ].contractInstance.address
            ),
          },
    PredictMultipleChoice_PredictMultipleChoiceNBAKnick76ers:
      json.contracts[
        "PredictMultipleChoice:PredictMultipleChoiceNBAKnick76ers"
      ] === undefined
        ? undefined
        : {
            ...json.contracts[
              "PredictMultipleChoice:PredictMultipleChoiceNBAKnick76ers"
            ],
            contractInstance: PredictMultipleChoice.at(
              json.contracts[
                "PredictMultipleChoice:PredictMultipleChoiceNBAKnick76ers"
              ].contractInstance.address
            ),
          },
    PredictMultipleChoice_PredictChoiceNGUTOP:
      json.contracts["PredictMultipleChoice:PredictChoiceNGUTOP"] === undefined
        ? undefined
        : {
            ...json.contracts["PredictMultipleChoice:PredictChoiceNGUTOP"],
            contractInstance: PredictMultipleChoice.at(
              json.contracts["PredictMultipleChoice:PredictChoiceNGUTOP"]
                .contractInstance.address
            ),
          },
    PredictMultipleChoice_PredictMultipleChoiceNGUTOP:
      json.contracts["PredictMultipleChoice:PredictMultipleChoiceNGUTOP"] ===
      undefined
        ? undefined
        : {
            ...json.contracts[
              "PredictMultipleChoice:PredictMultipleChoiceNGUTOP"
            ],
            contractInstance: PredictMultipleChoice.at(
              json.contracts[
                "PredictMultipleChoice:PredictMultipleChoiceNGUTOP"
              ].contractInstance.address
            ),
          },
    PredictMultipleChoice_PredictMultipleChoiceEuroFRCH:
      json.contracts["PredictMultipleChoice:PredictMultipleChoiceEuroFRCH"] ===
      undefined
        ? undefined
        : {
            ...json.contracts[
              "PredictMultipleChoice:PredictMultipleChoiceEuroFRCH"
            ],
            contractInstance: PredictMultipleChoice.at(
              json.contracts[
                "PredictMultipleChoice:PredictMultipleChoiceEuroFRCH"
              ].contractInstance.address
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
      : networkId === "testnet"
      ? testnetDeployments
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
