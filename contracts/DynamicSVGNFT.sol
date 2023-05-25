// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract DynamicSVGNFT is ERC721 {
    // NFT variables
    uint256 public s_tokenCounter;

    constructor() ERC721("Dynamic SVG NFT", "DSN") {
        s_tokenCounter = 0;
    }

    function mintNFT() public {
        _safeMint(msg.sender, s_tokenCounter);
        s_tokenCounter = s_tokenCounter + 1;
    }
}