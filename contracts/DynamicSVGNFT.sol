// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "base64-sol/base64.sol";

contract DynamicSVGNFT is ERC721 {
  // NFT variables
  uint256 public s_tokenCounter;
  string private i_lowImageURI;
  string private i_highImageURI;
  string private constant base64EncodedSvgPrefix = "data:image/svg+xml;base64,"; // you can use this on the web browser and will load up image after base64 encoding
  AggregatorV3Interface internal immutable i_priceFeed;
  mapping(uint256 => int256) public s_tokenIdToHigh;

  event NFTMinted(uint256 indexed tokenId, int256 highValue);

  constructor(
    address pricefeedAddress,
    string memory lowImage,
    string memory highImage
  ) ERC721("Dynamic SVG NFT", "DSN") {
    s_tokenCounter = 0;
    i_lowImageURI = svgToImageURI(lowImage);
    i_highImageURI = svgToImageURI(highImage);
    i_priceFeed = AggregatorV3Interface(pricefeedAddress);
  }

  // abi is a globally available method. the method allows string contcat to happen by turning the input into a byte array before type casted back to string.
  // after 0.8.12 +, one can use string.concat(a, b)
  function svgToImageURI(
    string memory svg
  ) public pure returns (string memory) {
    string memory svgBase64Encoded = Base64.encode(
      bytes(string(abi.encodePacked(svg)))
    ); // the svg will be converted by the base64 lib
    return string(abi.encodePacked(base64EncodedSvgPrefix, svgBase64Encoded)); // the prefix will be added to the encoded svg
  }

  function mintNFT(int256 highValue) public {
    s_tokenIdToHigh[s_tokenCounter] = highValue;
    _safeMint(msg.sender, s_tokenCounter);
    emit NFTMinted(s_tokenCounter, highValue);
    s_tokenCounter = s_tokenCounter + 1;
  }

  function _baseURI() internal pure override returns (string memory) {
    return base64EncodedSvgPrefix;
  }

  function tokenURI(
    uint256 tokenId
  ) public view virtual override returns (string memory) {
    require(
      _exists(tokenId),
      "ERC721Metadata: URI query for nonexistent token"
    );
    (, int256 price, , , ) = i_priceFeed.latestRoundData();
    string memory imageURI = i_lowImageURI;
    if (price >= s_tokenIdToHigh[tokenId]) {
      imageURI = i_highImageURI;
    }
    return
      string(
        abi.encodePacked(
          _baseURI(),
          Base64.encode(
            bytes(
              abi.encodePacked(
                '{"name":"',
                name(), // You can add whatever name here
                '", "description":"An NFT that changes based on the Chainlink Feed", ',
                '"attributes": [{"trait_type": "coolness", "value": 100}], "image":"',
                imageURI,
                '"}'
              )
            )
          )
        )
      );
  }
}
