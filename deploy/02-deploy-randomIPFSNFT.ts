import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import { ethers, getNamedAccounts, network } from "hardhat"
import { developmentChains, networkConfig } from "../helper-hardhat-config"
import verify from "../utils/verify"
import { storeImages } from "../utils/uploadToPinata"

const deployRandomIPFSNFT: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployer } = await getNamedAccounts()
  const { deploy } = hre.deployments

  console.log("------------------------------------")
  console.log("RandomIPFSNFT deployment")

  const chainId = network.config.chainId
  let tokenURIs
//   if (process.env.UPLOAD_TO_PINATA === "true") {
//     tokenURIs = await handleTokenURIs()
//   }

  let vrfCoordinatorV2Address, subscriptionId

  if (developmentChains.includes(network.name)) {
    const vrgCoordinatorV2Mock = await ethers.getContractAt("VRFCoordinatorV2Mock", deployer)
    vrfCoordinatorV2Address = vrgCoordinatorV2Mock.address
    const tx = await vrgCoordinatorV2Mock.createSubscription()
    const txReceipt = await tx.wait(1)
    subscriptionId = txReceipt.events[0].args.subscriptionId
  } else {
    vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2
    subscriptionId = networkConfig[chainId].subscriptionId
  }

  console.log("------------------------------------")
  storeImages("../images/randomIPFSNFT")
  const args = [vrfCoordinatorV2Address, subscriptionId], networkConfig[chainId].gasLane, networkConfig[chainId].callbackGasLimit, networkConfig[chainId].mintFee]

}

await function handleTokenURIs() {
    const tokenURIs = [] 
    // Store the Image in IPFS

    // Store the metadata in IPFS




    return tokenURIs
}

export default deployRandomIPFSNFT

deployRandomIPFSNFT.tags = ["all", "main", "randomIPFSNFT"]
