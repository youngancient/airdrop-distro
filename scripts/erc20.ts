import { ethers } from "hardhat";

async function main() {
  const ERC20_CONTRACT_ADDRESS = "0xDd979136878CDc1C6Eb2842E0237cD88CaD03D7c";
  const ERC20_ABI = [
    "function name() external view returns (string)",
    "function symbol() external view returns (string)",
    "function decimals() external view returns (uint8)",
    "function balanceOf(address owner) external view returns (uint256)",
    "function approve(address spender, uint256 value) external returns (bool)",
    "function transfer(address to, uint256 value) external returns (bool)",
  ];

  const [signer] = await ethers.getSigners();

  const erc20Contract = await ethers.getContractAt(
    ERC20_ABI,
    ERC20_CONTRACT_ADDRESS
  );

  const bal = await erc20Contract.balanceOf(signer.address);
  console.log("bal before -> ", ethers.formatUnits(bal, 18));

  const amount = ethers.parseUnits("10000", 18);

  const receiver = "0x97b3818902fBf430e1f7dC265F9F18aBCdb15442";
  const tx = await erc20Contract.transfer(receiver, amount);
  await tx.wait();

  const bal2 = await erc20Contract.balanceOf(signer.address);
  console.log("bal after -> ", ethers.formatUnits(bal2, 18));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
