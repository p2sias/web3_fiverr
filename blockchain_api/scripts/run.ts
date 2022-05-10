// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.

// eslint-disable prettier/prettier
import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const accountBalance = await deployer.getBalance();

  console.log("Deploying contracts with account: ", deployer.address);
  console.log("Account balance: ", accountBalance.toString());

  const salesContractFactory = await ethers.getContractFactory("webThreeSales");
  const salesContract = await salesContractFactory.deploy({
    //value: ethers.utils.parseEther("0.01"),
  });

  await salesContract.deployed();

  console.log("sales address: ", salesContract.address);

  const contractBalance = await ethers.provider.getBalance(
    salesContract.address
  );
  console.log("Contract balance:", ethers.utils.formatEther(contractBalance));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
