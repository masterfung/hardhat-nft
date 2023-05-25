import { deployments, ethers, getNamedAccounts, network } from "hardhat"
import { developmentChains } from "../../helper-hardhat-config"
import {
  RandomIPFSNFT,
  RandomIPFSNFT__factory,
  VRFCoordinatorV2Mock,
} from "../../typechain-types"
import { assert, expect } from "chai"

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("RandomIPFSNFT", function () {
      let RandomIPFSNFT: RandomIPFSNFT__factory,
        deployer: string,
        deployedRandomIPFSNFT: RandomIPFSNFT,
        accounts,
        address: string,
        vrfCoordinatorV2Mock: VRFCoordinatorV2Mock

      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer
        accounts = await ethers.getSigners()
        await deployments.fixture(["all"])
        const randomIPFSNftDeployment = await deployments.get("RandomIPFSNFT")
        const vrfV2Deployment = await deployments.get("VRFCoordinatorV2Mock")
        deployedRandomIPFSNFT = await ethers.getContractAt(
          "RandomIPFSNFT",
          randomIPFSNftDeployment.address
        )
        vrfCoordinatorV2Mock = await ethers.getContractAt(
          "VRFCoordinatorV2Mock",
          vrfV2Deployment.address
        )
      })

      describe("constructor", function () {
        it("sets the token URIs with ipfs://", async function () {
          const dogTokenUriFirst = await deployedRandomIPFSNFT.getDogTokenURI(0)
          const contractInitialized =
            await deployedRandomIPFSNFT.getInitialized()
          assert(dogTokenUriFirst.includes("ipfs://"))
          assert.equal(contractInitialized, true)
        })

        it("should have a token URI length of 3", async function () {
          const getDogTokenURI = await deployedRandomIPFSNFT.getDogTokenURIs()
          assert.equal(getDogTokenURI.length, 3)
        })
      })

      describe("requestNFT", function () {
        it("should fail if mintFee is not met", async function () {
          await expect(
            deployedRandomIPFSNFT.requestNFT()
          ).to.be.revertedWithCustomError(
            deployedRandomIPFSNFT,
            "RandomIPFSNFT__InsufficientMintFee"
          )
        })

        it("emits and event and kicks off a random word request", async function () {
          const fee = await deployedRandomIPFSNFT.getMintFee()
          await expect(
            deployedRandomIPFSNFT.requestNFT({ value: fee.toString() })
          ).to.emit(deployedRandomIPFSNFT, "NFTRequested")
        })
      })

      describe("fulfillRandomness", function () {
        let requestNFTResponse
        beforeEach(async function () {
          const mintFee = await deployedRandomIPFSNFT.getMintFee()
          requestNFTResponse = await deployedRandomIPFSNFT.requestNFT({ value: mintFee.toString() })
          const requestReceipt = await requestNFTResponse.wait(1)
        //   console.log('requestReceipt', requestReceipt)
          await vrfCoordinatorV2Mock.fulfillRandomWords(
            requestReceipt.events[1].args.requestId,
            deployedRandomIPFSNFT.address
          )
        })

        it("should mint after request for random word is fulfilled", async function () {
          await new Promise<void>(async (resolve, reject) => {
            deployedRandomIPFSNFT.once("NFTMinted", async () => {
              console.log("OINK!")
              try {
                const tokenURI = await deployedRandomIPFSNFT.getDogTokenURI(0)
                const tokenCounter =
                  await deployedRandomIPFSNFT.getTokenCounter()
                assert.equal(tokenCounter.toString(), "1")
                assert.equal(tokenURI.includes("ipfs://"), true)
                resolve()
              } catch (error) {
                console.log(
                  "An error has occurred with fulling randomness:",
                  error
                )
                reject(error)
              }
            })
          })
        })
      })
    })
