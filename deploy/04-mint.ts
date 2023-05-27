import { DeployFunction } from "hardhat-deploy/dist/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { developmentChains } from "../helper-hardhat-config"

const deployNFT: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployments, getNamedAccounts, network, ethers } = hre
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()

  // BasicNFT
  const basicNFTDeployment = await deployments.get("BasicNFT")
  const basicNFT = await ethers.getContractAt(
    "BasicNFT",
    basicNFTDeployment.address
  )
  const basicNFTMintTx = await basicNFT.mintNFT()
  await basicNFTMintTx.wait(1)
  console.log(`BasicNFT has tokenURI as ${await basicNFT.tokenURI(0)}`)

  // RandomIPFS NFT
  const randomIPFSNFTDeployment = await deployments.get("RandomIPFSNFT")
  const randomIPFSNFT = await ethers.getContractAt(
    "RandomIPFSNFT",
    randomIPFSNFTDeployment.address
  )
  const mintFee = await randomIPFSNFT.getMintFee()

  await new Promise<void>(async (resolve, reject) => {
    randomIPFSNFT.on("NFTMinted", async function () {
      resolve()
    })
    const randomIPFSNFTMintTx = await randomIPFSNFT.requestNFT({
      value: mintFee.toString(),
    })
    const randomIPFSNFTMintTxReceipt = await randomIPFSNFTMintTx.wait(1)
    if (developmentChains.includes(network.name)) {
      const requestID =
        randomIPFSNFTMintTxReceipt.events[1].args.requestId.toString()
      const vrfCoordinatorV2MockDeployment = await deployments.get(
        "VRFCoordinatorV2Mock"
      )
      const vrfCoordinatorV2Mock = await ethers.getContractAt(
        "VRFCoordinatorV2Mock",
        vrfCoordinatorV2MockDeployment.address
      )
      await vrfCoordinatorV2Mock.fulfillRandomWords(
        requestID,
        randomIPFSNFT.address
      )
    }
  })
  console.log(
    `RandomIPFSNFT has tokenURI as ${await randomIPFSNFT.tokenURI(0)}`
  )

  // DynamicNFT
  const highValue = ethers.utils.parseEther("1900")
  const dynamicNFTDeployment = await deployments.get("DynamicSVGNFT")
  const dynamicNFT = await ethers.getContractAt(
    "DynamicSVGNFT",
    dynamicNFTDeployment.address
  )
const dynamicNFTMintTx = await dynamicNFT.mintNFT(highValue)
await dynamicNFTMintTx.wait(1)
console.log(`Dynamic SVG NFT index 0 has tokenURI as ${await dynamicNFT.tokenURI(0)}`)
}

export default deployNFT
deployNFT.tags = ["all", "nft", "main"]