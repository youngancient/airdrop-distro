import { ethers } from "hardhat";

async function main() {
  const CONTRACT_ADDRESS =
    "0x2aD44265185a6e739b53cBF6B190b43726553627".toLowerCase();
  //   Human-readable ABI
  const ABI = [
    "function balances(address) view returns (uint256)",
    "function owner() view returns (address)",
    "function mintToken(uint256 amount, address to)",
    "function transferToken(uint256 amount, address to)",
    "function getTokenDetail() view returns (string _name, string _symbol, uint256 _currentSupply, uint256 _maxSupply)",
  ];

  const [signer] = await ethers.getSigners();

  //   contract object
  const tokenContract = await ethers.getContractAt(ABI, CONTRACT_ADDRESS);

  //**** Read functions ****/
  //   get balance
  const balance = await tokenContract.balances(signer.address);

  //   get owner
  const owner = await tokenContract.owner();

  //   get token details
  const [name, symbol, currentSupply, maxSupply] =
    await tokenContract.getTokenDetail();
  

  //**** Write functions ****/

  //   mint token
  const amount = ethers.parseUnits("1000", 18);

  //xxxxxxxxxxxxxxxxxxxxxx/
  const mintTx = await tokenContract.mintToken(amount, signer.address);
  await mintTx.wait();
  //xxxxxxxxxxxxxxxxxxxxxx/


  //   transfer token
  const amt = ethers.parseUnits("100", 18);
  const receiver = "0x20d8eef9687cc126b586103911a4525f5351ae11".toLowerCase();

  
  //xxxxxxxxxxxxxxxxxxxxxx/
  const transferTx = await tokenContract.transferToken(amt, receiver);
  await transferTx.wait();
  //xxxxxxxxxxxxxxxxxxxxxx/

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
