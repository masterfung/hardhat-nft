import { deployments, ethers, getNamedAccounts, network } from "hardhat"
import { developmentChains } from "../../helper-hardhat-config"
import { BasicNFT, BasicNFT__factory } from "../../typechain-types"
import { assert } from "chai"
import { BigNumber } from "ethers"

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("BasicNFT", function () {
      let basicNFT: BasicNFT__factory
      let deployer: string
      let deployedBasicNFT: BasicNFT
      let accounts
      let basicNFTAddress: string

      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer
        accounts = await ethers.getSigners()
        await deployments.fixture(["all"])
        basicNFTAddress = (await deployments.get("BasicNFT")).address
        deployedBasicNFT = await ethers.getContractAt("BasicNFT", basicNFTAddress)

      })

      describe("constructor", function () {
        it("checking constructor values", async function () {
          const name = await deployedBasicNFT.name()
          const symbol = await deployedBasicNFT.symbol()
          assert.equal(name, "CutePup")
          assert.equal(symbol, "CPUP")
          assert.equal((await deployedBasicNFT.getTokenCounter()).toString(), "0")
        })
      })

      describe("mint", function() {
        it("should mint a NFT PUP", async function() {
          await deployedBasicNFT.mintNFT()
          assert.equal((await deployedBasicNFT.getTokenCounter()).toString(), "1")

        })
      })

      describe("tokenURI", function() {
        it("should retrieve the right URI", async function() {
          const uri = await deployedBasicNFT.tokenURI(BigNumber.from(0))
          assert(uri.includes("ipfs://"))
        })
      })
    })
