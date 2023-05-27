import { developmentChains, networkConfig } from "../helper-hardhat-config"
import verify from "../utils/verify"
import { DeployFunction } from "hardhat-deploy/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import fs from "fs"

const deployDynamicNFT: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployments, getNamedAccounts, network, ethers } = hre
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()

  const chainId = network.config.chainId!
  let ethUSDPriceFeedAddress: string

  if (developmentChains.includes(network.name)) {
    const ETHUSDAggregatorDeployer = await deployments.get("MockV3Aggregator")
    const ETHUSDAggregator = await ethers.getContractAt(
      "MockV3Aggregator",
      ETHUSDAggregatorDeployer.address
    )
    ethUSDPriceFeedAddress = ETHUSDAggregator.address
  } else {
    ethUSDPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
  }
  console.log("-----------------------------------")
  const lowSVG = await fs.readFileSync("./images/dynamicSVG/frown.svg", {
    encoding: "utf8",
  })
  const highSVG = await fs.readFileSync("./images/dynamicSVG/smile.svg", {
    encoding: "utf8",
  })

  const args = [ethUSDPriceFeedAddress, lowSVG, highSVG]
  const dynamicSVG = await deploy("DynamicSVGNFT", {
    args: args,
    from: deployer,
    log: true,
    waitConfirmations: 1,
  })
  console.log("-----------------------------------")
  // Verify the deployment to Etherscan
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    console.log("Verifying...")
    await verify(dynamicSVG.address, args)
  }
}

export default deployDynamicNFT

deployDynamicNFT.tags = ["all", "dynamicNFT", "main"]