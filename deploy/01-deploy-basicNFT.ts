import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import { getNamedAccounts, network } from "hardhat"
import { developmentChains, networkConfig } from "../helper-hardhat-config"
import verify from "../utils/verify"

const deployBasicNFT: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployer } = await getNamedAccounts()
  const { deploy } = hre.deployments

  console.log("------------------------------------")
  console.log("BasicNFT deployment")
  const args: any[] = []
  const basicNFT = await deploy("BasicNFT", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: 1,
  })

  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    console.log("------------------------------------")
    console.log('Verifying on Etherscan...')
    await verify(basicNFT.address, args)
  }
}

export default deployBasicNFT

deployBasicNFT.tags = ["all", "main", "basicNFT"]
