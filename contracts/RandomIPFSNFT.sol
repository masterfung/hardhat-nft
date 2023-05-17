// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract RandomIPFSNFT is VRFConsumerBaseV2, ERC721 {

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

  // we will mint NFT via the use of Chainlink VRF to get us a random number
  // this random number will allow us to get a random NFT [Shiba, Pug, Labrador]
  constructor(
    address vrfCoordinatorV2,
    uint64 subscriptionId,
    bytes32 gasLane,
    uint32 callbackLimit
  ) VRFConsumerBaseV2(vrfCoordinatorV2) ERC721("RandomIPFSNFT", "RIN") {
    i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
    i_callbackGasLimit = callbackLimit;
    i_gasLane = gasLane;
    i_subscriptionId = subscriptionId;
  }

  function requestNFT() public returns (uint256 requestId) {
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
    _safeMint(dogOwner, newTokenId);
  }

  function tokenURI(uint256 uri) public override view returns(string memory) {

  }
}
