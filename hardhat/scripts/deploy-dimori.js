const hre = require("hardhat");
const fs = require('fs');
const fse = require('fs-extra');
const { verify } = require('../utils/verify')

const MATIC_NETWORK = ["https://rpc-mumbai.matic.today/", "mumbai"]
const LOCAL_NETWORK = ["localhost", "ganache"]
var NETWORKS = LOCAL_NETWORK

async function deployMock() {
  const DECIMALS = "8"
  const INITIAL_PRICE = "200000000000"
  const Mock = await hre.ethers.getContractFactory("MockV3Aggregator")

  console.log("Deploying price feed mock");
  const mockContract = await Mock.deploy(DECIMALS, INITIAL_PRICE)

  await mockContract.deployed();
  console.log("Price feed mock deployed to:", mockContract.address);

  return mockContract.address;
}

async function main() {
  /* these two lines deploy the contract to the network */
  let listingFee = hre.ethers.utils.parseEther("0.001", "ether");
  var priceFeedAddress;
  if (NETWORKS.includes(hre.network.name)) {
    priceFeedAddress = await deployMock()
  }
  // For deploying to polygon mainnet or testnet
  // const priceFeedAddress = ""

  const DimoriSmartContract = await hre.ethers.getContractFactory("DimoriMain")
  const dimoriContract = await DimoriSmartContract.deploy(listingFee, priceFeedAddress)
  await dimoriContract.deployed();
  console.log("Dimori deployed to:", dimoriContract.address);
  console.log("Network deployed to :", hre.network.name);

  /* transfer contracts addresses & ABIs to the front-end */
  if (fs.existsSync("../src")) {
    fse.copySync("./artifacts/build-info", "../src/artifacts/build-info")
    fse.copySync("./artifacts/contracts", "../src/artifacts/contracts")
    fs.writeFileSync("../src/utils/contracts-config.js", `
      export const contractAddress = "${dimoriContract.address}"
      export const ownerAddress = "${dimoriContract.signer.address}"
      export const networkDeployedTo = "${hre.network.config.chainId}"
    `)
  }

  if (!NETWORKS.includes(hre.network.name) && hre.config.etherscan.apiKey !== "") {
    await dimoriContract.deployTransaction.wait(6)
    await verify(dimoriContract.address, [listingFee, priceFeedAddress])
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
