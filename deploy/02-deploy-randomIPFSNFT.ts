import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import { getNamedAccounts, network } from "hardhat"
import { developmentChains, networkConfig } from "../helper-hardhat-config"
import verify from "../utils/verify"

const deployRandomIPFSNFT: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    
}

export default deployRandomIPFSNFT

deployRandomIPFSNFT.tags = ["all", "main", "randomIPFSNFT"]