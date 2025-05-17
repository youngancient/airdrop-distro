import { ethers } from "hardhat";
import { AirdropEntity, generateMerkleTree } from "./merkleScript";

export const stripLeadingZeros = (address: string): string => {
  return "0x" + address.slice(-40);
};

function getTotalAirdropAmount(entities: AirdropEntity[]): string {
  let total = BigInt(0);

  for (const entity of entities) {
    total += BigInt(entity.amount);
  }

  return total.toString();
}

async function main() {
  const FACTORY_CONTRACT_ADDRESS = "0x82923c950cA5444b85ad66F59586e142Cc3Ec251";

  const factory_abi = [
    // createSonikDrop with NFT gating
    "function createSonikDrop(address _tokenAddress, bytes32 _merkleRoot, string _name, address _nftAddress, uint256 _noOfClaimers, uint256 _totalOutputTokens) external returns (address)",

    // createSonikDrop without NFT gating
    "function createSonikDrop(address _tokenAddress, bytes32 _merkleRoot, string _name, uint256 _noOfClaimers, uint256 _totalOutputTokens) external returns (address)",

    // view functions
    "function getOwnerSonikDropClones(address _owner) external view returns (address[] memory)",
    "function getAllSonikDropClones() external view returns (address[] memory)",

    // events (optional for listening in frontend)
    "event SonikCloneCreated(address indexed creator, uint256 timestamp, address indexed clone)",
  ];

  const tokenFactoryContract = await ethers.getContractAt(
    factory_abi,
    FACTORY_CONTRACT_ADDRESS
  );

  const ERC20_CONTRACT_ADDRESS = "0xDd979136878CDc1C6Eb2842E0237cD88CaD03D7c";
  const ERC20_ABI = [
    "function name() external view returns (string)",
    "function symbol() external view returns (string)",
    "function decimals() external view returns (uint8)",
    "function balanceOf(address owner) external view returns (uint256)",
    "function approve(address spender, uint256 value) external returns (bool)",
  ];

  const erc20Contract = await ethers.getContractAt(
    ERC20_ABI,
    ERC20_CONTRACT_ADDRESS
  );

  const entities: AirdropEntity[] = [
    {
      address: "0x99cb7f24da7f4bf494bb9740a3ff46d07bee1525",
      amount: "50000000000000000000",
    },
    {
      address: "0x0f09D1Fb501041E32170b1B759f1b2ef6349C490",
      amount: "310000000000000000000",
    },
    {
      address: "0xc9cd96ce406eeb5b7ccecf19415eb640953ff6a0",
      amount: "200000000000000000000",
    },
    {
      address: "0xfd5671504514c0214dfb30b1d820d71a891af913",
      amount: "90000000000000000000",
    },
    {
      address: "0x14fab7ffc93cecea209cd310a18eb1a760a904a0",
      amount: "140000000000000000000",
    },
  ];

  const totalAmount = getTotalAirdropAmount(entities);
  const { rootHash, output } = generateMerkleTree(entities);

  console.log(output);
  const name = "Chihuahua";
  const tokenAddress = "0xDd979136878CDc1C6Eb2842E0237cD88CaD03D7c";
  const merkleRoot = rootHash;
  const nftAddress = ethers.ZeroAddress;
  const noOfClaimers = entities.length;
  const totalOutputTokens = totalAmount;

  const approveTx = await erc20Contract.approve(
    FACTORY_CONTRACT_ADDRESS,
    totalOutputTokens
  );
  await approveTx.wait();
  console.log("approval completed >>>>");
  const estimateGas = await tokenFactoryContract[
    "createSonikDrop(address,bytes32,string,address,uint256,uint256)"
  ].estimateGas(
    tokenAddress,
    merkleRoot,
    name,
    nftAddress,
    noOfClaimers,
    totalOutputTokens
  );

  console.log(Number(estimateGas));

  // i need to approve token first
  const tx = await tokenFactoryContract[
    "createSonikDrop(address,bytes32,string,address,uint256,uint256)"
  ](
    tokenAddress,
    merkleRoot,
    name,
    nftAddress,
    noOfClaimers,
    totalOutputTokens
  );

  const reciept = await tx.wait();
  if (reciept.status === 1) {
    console.log("Token drop Creation Successful!");
    // console.log(reciept);
    // Find the emitted event with the new contract's address
    const eventLogs = reciept.logs;

    if (eventLogs) {
      const deployedContractAddress = eventLogs[0].topics[2];
      console.log(
        "token drop address: -> ",
        stripLeadingZeros(deployedContractAddress)
      );
    } else {
      console.log("Deployment event not found.");
    }
    // setCreationStatus("success");
    return;
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
