// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "hardhat/console.sol";

error RandomIPFSNFT__RangeOutOfBounds();
error RandomIPFSNFT__InsufficientMintFee();
error RandomIPFSNFT__WithdrawFailed();
error RandomIPFSNFT__AlreadyInitialized();

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
  uint256 private i_mintFee;
  uint256 public s_tokenCounter;
  mapping(uint256 => Breed) private s_tokenIdToBreed;
  uint256 internal constant MAX_CHANCE_VALUE = 100;
  string[] internal i_dogTokenURIs;
  bool private s_initialized;

  // events
  event NFTRequested(uint256 indexed requestId, address requester);
  event NFTMinted(Breed breed, address mintTo);

  // we will mint NFT via the use of Chainlink VRF to get us a random number
  // this random number will allow us to get a random NFT [Shiba, Pug, Labrador]
  constructor(
    address vrfCoordinatorV2,
    uint64 subscriptionId,
    bytes32 gasLane, // keyHash
    uint256 mintFee,
    uint32 callbackGasLimit,
    string[3] memory dogTokenUris
  ) VRFConsumerBaseV2(vrfCoordinatorV2) ERC721("Random IPFS NFT", "RIN") {
    i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
    i_gasLane = gasLane;
    i_subscriptionId = subscriptionId;
    i_mintFee = mintFee;
    i_callbackGasLimit = callbackGasLimit;
    _initializeContract(dogTokenUris);
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
    emit NFTRequested(requestId, msg.sender);
  }

  function _initializeContract(string[3] memory dogTokenUris) private {
    if (s_initialized) {
      revert RandomIPFSNFT__AlreadyInitialized();
    }
    i_dogTokenURIs = dogTokenUris;
    s_initialized = true;
  }

  function fulfillRandomWords(
    uint256 requestId,
    uint256[] memory randomWords
  ) internal override {
    address dogOwner = s_requestIdToSender[requestId];
    uint256 newItemId = s_tokenCounter;
    s_tokenCounter = s_tokenCounter + 1;
    uint256 moddedRng = randomWords[0] % MAX_CHANCE_VALUE;
    Breed dogBreed = getBreedFromModdedRng(moddedRng);
    _safeMint(dogOwner, newItemId);
    _setTokenURI(newItemId, i_dogTokenURIs[uint256(dogBreed)]);
    emit NFTMinted(dogBreed, dogOwner);
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

  function getMintFee() public view returns (uint256) {
    return i_mintFee;
  }

  function getDogTokenURI(uint256 index) public view returns (string memory) {
    return i_dogTokenURIs[index];
  }

  function getTokenCounter() public view returns (uint256) {
    return s_tokenCounter;
  }
}
