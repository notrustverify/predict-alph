"use strict";
/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamicArrayForIntInstance = exports.DynamicArrayForInt = void 0;
const web3_1 = require("@alephium/web3");
const DynamicArrayForInt_ral_json_1 = __importDefault(require("../DynamicArrayForInt.ral.json"));
const contracts_1 = require("./contracts");
class Factory extends web3_1.ContractFactory {
    constructor() {
        super(...arguments);
        this.tests = {
            get: async (params) => {
                return (0, web3_1.testMethod)(this, "get", params);
            },
            push: async (params) => {
                return (0, web3_1.testMethod)(this, "push", params);
            },
            pop: async (params) => {
                return (0, web3_1.testMethod)(this, "pop", params);
            },
            sum: async (params) => {
                return (0, web3_1.testMethod)(this, "sum", params);
            },
        };
    }
    at(address) {
        return new DynamicArrayForIntInstance(address);
    }
}
// Use this object to test and deploy the contract
exports.DynamicArrayForInt = new Factory(web3_1.Contract.fromJson(DynamicArrayForInt_ral_json_1.default, "", "beb8a20fd7d8e4169c3c36daff2c0fac806dd074ab6908d83a246f8a9c055e81"));
// Use this class to interact with the blockchain
class DynamicArrayForIntInstance extends web3_1.ContractInstance {
    constructor(address) {
        super(address);
        this.methods = {
            get: async (params) => {
                return (0, web3_1.callMethod)(exports.DynamicArrayForInt, this, "get", params, contracts_1.getContractByCodeHash);
            },
            push: async (params) => {
                return (0, web3_1.callMethod)(exports.DynamicArrayForInt, this, "push", params, contracts_1.getContractByCodeHash);
            },
            pop: async (params) => {
                return (0, web3_1.callMethod)(exports.DynamicArrayForInt, this, "pop", params, contracts_1.getContractByCodeHash);
            },
            sum: async (params) => {
                return (0, web3_1.callMethod)(exports.DynamicArrayForInt, this, "sum", params, contracts_1.getContractByCodeHash);
            },
        };
    }
    async fetchState() {
        return (0, web3_1.fetchContractState)(exports.DynamicArrayForInt, this);
    }
    async multicall(calls) {
        return (await (0, web3_1.multicallMethods)(exports.DynamicArrayForInt, this, calls, contracts_1.getContractByCodeHash));
    }
}
exports.DynamicArrayForIntInstance = DynamicArrayForIntInstance;
