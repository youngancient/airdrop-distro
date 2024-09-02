import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-network-helpers");


async function main() {
    const cwtTokenAddress = "0x669eEe68Ef39E12D1b38d1f274BFc9aC46D771CB";
    const cwt = await ethers.getContractAt("IERC20", cwtTokenAddress);

    const merkleAirdropContractAddress = "0x319b4Ab6f8DBA2AF7DF5b7e9872b0616ecC3299e";
    const merkleAirdrop = await ethers.getContractAt("MerkleAirdrop", merkleAirdropContractAddress);


    // returns the balance of CWT tokens in the contract that will be airdropped
    const contractBalance = await merkleAirdrop.getContractBalance();
    console.log(contractBalance);

    const USER = "0xa6B1feB40D1c8eeAD5AFD6f7372E02B637F142FA";

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
