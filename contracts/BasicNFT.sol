// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract BasicNFT is ERC721 {
    string public constant TOKEN_URI =
        "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json";
    uint256 private s_tokenCount;

    constructor() ERC721("CutePup", "CPUP") {
        s_tokenCount = 0;
    }

    function mintNFT() public returns(uint256) {
        _safeMint(msg.sender, s_tokenCount);
        s_tokenCount = s_tokenCount + 1;
        return s_tokenCount;
    }

    /** We are overriding the ERC721 function */
    function tokenURI(uint256 /** tokenId but not used */) public pure override returns(string memory) {
        return TOKEN_URI;
    }

    function getTokenCounter() public view returns(uint256) {
        return s_tokenCount;
    }
}