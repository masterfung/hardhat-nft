// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error RandomIPFSNFT__RangeOutOfBounds();
error RandomIPFSNFT__InsufficientMintFee();
error RandomIPFSNFT__WithdrawFailed();

contract RandomIPFSNFT is VRFConsumerBaseV2, ERC721URIStorage, Ownable {
  // Types of Dogs
  enum Breed {
    SHIBA_INU,
    PUG,
    ST_BERNARD
  }

  // Chainlink VRF Variables
  VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
  uint64 private immutable i_subscriptionId;
  bytes32 private immutable i_gasLane;
  uint32 private immutable i_callbackGasLimit;
  uint16 private constant REQUEST_CONFIRMATIONS = 3;
  uint32 private constant NUM_WORDS = 1;

  // VRF Helpers
  mapping(uint256 => address) private s_requestIdToSender;

  // NFT Variables
  uint256 public s_tokenCounter;
  uint256 internal constant MAX_CHANCE_VALUE = 100;
  string[] internal i_dogTokenURIs;
  uint256 internal i_mintFee;

  // we will mint NFT via the use of Chainlink VRF to get us a random number
  // this random number will allow us to get a random NFT [Shiba, Pug, Labrador]
  constructor(
    address vrfCoordinatorV2,
    uint64 subscriptionId,
    bytes32 gasLane,
    uint32 callbackLimit,
    // the reason why its ERC721 is because underlying contract is ERC721
    string[3] memory dogTokenURIs,
    uint256 mintFee
  ) VRFConsumerBaseV2(vrfCoordinatorV2) ERC721("RandomIPFSNFT", "RIN") {
    i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
    i_callbackGasLimit = callbackLimit;
    i_gasLane = gasLane;
    i_subscriptionId = subscriptionId;
    s_tokenCounter = 0;
    i_dogTokenURIs = dogTokenURIs;
    i_mintFee = mintFee;
  }

  function requestNFT() public payable returns (uint256 requestId) {
    if (msg.value < i_mintFee) {
      revert RandomIPFSNFT__InsufficientMintFee();
    }
    requestId = i_vrfCoordinator.requestRandomWords(
      i_gasLane,
      i_subscriptionId,
      REQUEST_CONFIRMATIONS,
      i_callbackGasLimit,
      NUM_WORDS
    );
    s_requestIdToSender[requestId] = msg.sender;
  }

  function fullfillRandomWords(
    uint256 requestId,
    uint256[] memory randomWords
  ) internal {
    address dogOwner = s_requestIdToSender[requestId];
    uint256 newTokenId = s_tokenCounter;
    // We will now need to now get the breed of dog
    uint256 moddedRNG = randomWords[0] % MAX_CHANCE_VALUE;
    // 0-99 would be the result from above
    // 7 -> Shiba Inu
    // 30 -> Pug
    // 88 -> ST_BERNARD
    // 45 -> ST_BERNARD

    Breed dogBreed = getBreedFromModdedRng(moddedRNG);
    // safeMint is called from ERC721
    _safeMint(dogOwner, newTokenId);
    _setTokenURI(newTokenId, i_dogTokenURIs[uint256(dogBreed)]);
  }

  function withdraw() public payable onlyOwner {
    uint256 amount = address(this).balance;
    (bool success, ) = payable(msg.sender).call{value: amount}("");
    if (!success) {
        revert RandomIPFSNFT__WithdrawFailed();
    }
    }

  function getBreedFromModdedRng(
    uint256 moddedRNG
  ) public pure returns (Breed) {
    uint256 cumulativeSum = 0;
    uint256[3] memory chanceArray = getChanceArray();
    for (uint256 i = 0; i < chanceArray.length; i++) {
      if (
        moddedRNG >= cumulativeSum && moddedRNG < cumulativeSum + chanceArray[i]
      ) {
        return Breed(i);
      }
      cumulativeSum += chanceArray[i];
    }
    revert RandomIPFSNFT__RangeOutOfBounds();
  }

  function getChanceArray() public pure returns (uint256[3] memory) {
    // this is the chance of the NFT, from 10% of chance for the rarest to 60% for the most common
    return [10, 30, MAX_CHANCE_VALUE];
  }
}
