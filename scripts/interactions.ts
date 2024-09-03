import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-network-helpers");

async function main() {
  const cwtTokenAddress = "0x669eEe68Ef39E12D1b38d1f274BFc9aC46D771CB";
  const cwt = await ethers.getContractAt("IERC20", cwtTokenAddress);

  const merkleAirdropContractAddress =
    "0x319b4Ab6f8DBA2AF7DF5b7e9872b0616ecC3299e";
  const merkleAirdrop = await ethers.getContractAt(
    "MerkleAirdrop",
    merkleAirdropContractAddress
  );

  // returns the balance of CWT tokens in the contract that will be airdropped
  const contractBalance = await merkleAirdrop.getContractBalance();
  console.log(contractBalance);

  // test user
  const USER = {
    address: "0xa6B1feB40D1c8eeAD5AFD6f7372E02B637F142FA",
    amount: "1800",
  };

  // checks user token balance
  const userTokenBalance = await cwt.balanceOf(USER.address);
  console.log(userTokenBalance);

  // checks contract token balance
  const contractTokenBalance = await merkleAirdrop.getContractBalance();
  console.log("contract balance : " + contractTokenBalance);

  // merkle root
  const merkleRoot =
    "0xc2635d49a927cf06ff1e8646a3c4d2d6808947f771c7faebe4b63b09df24b449";

  const amountToClaim = ethers.parseUnits(USER.amount, 18);

  const merkleProof = [
    "0xfa0d57a3d7939cad7a6684171f85096258eca1b7ca58c3f97ec858a33c34e94f",
    "0x696eef287a4fbd7bd7bc5352f4265f345be6b226001a478c2b53499e8f838fc1",
    "0xb5eaffd0f7475ded5c6725bd61805a19d758856881e8b93d283e04376de804ab",
    "0xbfd7da3d136e91e54d7d13839d798ab81c320f19f38f8e11672c3d0d1afb7192",
  ];
//   const arrayToStore: string[] = [
//     ethers.forma.formatBytes32String("item1"),
//     ethers.utils.formatBytes32String("item2"),
//     ethers.utils.formatBytes32String("item3"),
// ];

  try {
    const tx = await merkleAirdrop.claimAirdrop(amountToClaim, merkleProof);

    console.log(`Transaction sent: ${tx.hash}`);

    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    console.log(receipt);

    console.log("Airdrop claimed successfully");

    // Check contract balance after claiming
    const contractBalanceAfter = await merkleAirdrop.getContractBalance();
    console.log("contract balance after: " + contractBalanceAfter);

    //   user balance after
    const userTokenBalanceAfter = await cwt.balanceOf(USER.address);
    console.log(userTokenBalanceAfter);
  } catch (error) {
    console.error("Error claiming airdrop:", error);
  }

  // console.log("Contract balance before :::", contractBalanceBeforeDeposit);

  // const depositAmount = ethers.parseUnits("150", 18);
  // const depositTx = await merkleAirdrop.deposit(depositAmount);

  // console.log(depositTx);

  // depositTx.wait();

  // const contractBalanceAfterDeposit = await merkleAirdrop.getContractBalance();

  // console.log("Contract balance after :::", contractBalanceAfterDeposit);

  // Withdrawal Interaction
  // const contractBalanceBeforeWithdrawal = await saveERC20.getContractBalance();
  // console.log(contractBalanceBeforeWithdrawal);
  // const withdrawAmount = ethers.parseUnits("100",18);
  // const withdrawTx = await saveERC20.withdraw(withdrawAmount);
  // console.log(withdrawTx);
  // withdrawTx.wait();
  // const contractBalanceAfterWithdrawal = await saveERC20.getContractBalance();
  // console.log(contractBalanceAfterWithdrawal);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
