import { HardhatUserConfig } from "hardhat/config"
import "@nomicfoundation/hardhat-toolbox"
import "hardhat-deploy"
import "dotenv/config"
import "hardhat-gas-reporter"
import "@typechain/hardhat"
import "@nomicfoundation/hardhat-chai-matchers"

const GOERLI_ALCHEMY_URL = process.env.ALCHEMY_GOERLI_RPC_URL
const PK = process.env.PK_TESTNET!
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY
const MAINNET_RPC_URL_FORKED = process.env.MAINNET_RPC_URL_FORKED!

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.7",
      },
      {
        version: "0.6.6",
      },
    ],
  },
  defaultNetwork: "hardhat",
  networks: {
    goerli: {
      url: GOERLI_ALCHEMY_URL,
      accounts: [PK],
      chainId: 5,
    },
    hardhat: {
      chainId: 31337,
      // gasPrice: 130000000000,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
      1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
    // coinmarketcap: COINMARKETCAP_API_KEY,
  },
  mocha: {
    timeout: 200000, // 200 seconds max for running tests
  },
}

export default config
