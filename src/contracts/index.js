import { ethers } from "ethers";

import Contrats from "./contracts/56.json";

const supportChainId = 56;

const RPCS = {
    1: "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
    56: "https://bsc-dataseed1.ninicoin.io",
    4: "https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
}

const providers = {
    1: new ethers.providers.JsonRpcProvider(RPCS[1]),
    4: new ethers.providers.JsonRpcProvider(RPCS[4]),
    56: new ethers.providers.JsonRpcProvider(RPCS[56])
}

const bnbStakingContract = new ethers.Contract(Contrats.token.address, Contrats.token.abi, providers[supportChainId]);

export {
    bnbStakingContract
}