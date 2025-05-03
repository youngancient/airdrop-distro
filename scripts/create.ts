import { ethers } from "hardhat";
import { generateMerkleTreeFromAddresses } from "./merkleScript";

export const stripLeadingZeros = (address: string): string => {
  return "0x" + address.slice(-40);
};

async function main() {
  const FACTORY_CONTRACT_ADDRESS = "0x9a4346DdA58198D663F94c9Bd3eD95374336EAb2";
  const factory_abi = [
    // "function createSonikPoap(string _name, string _symbol, string _baseURI, bytes32 _merkleRoot, address _nftAddress, uint256 _claimTime, uint256 _noOfClaimers) external",
    // "function createSonikPoap(string _name, string _symbol, string _baseURI, bytes32 _merkleRoot, address _nftAddress, uint256 _claimTime, uint256 _noOfClaimers, bool _isCollection) external",
    "function createSonikPoap(string _name, string _symbol, string _baseURI, bytes32 _merkleRoot, address _nftAddress, uint256 _noOfClaimers) external",
    // "function createSonikPoap(string _name, string _symbol, string _baseURI, bytes32 _merkleRoot, uint256 _noOfClaimers) external",
    "function getOwnerSonikPoapClones(address _owner) external view returns (address[])",
    "function getAllSonikPoapClones() external view returns (address[])",
  ];

  const poapFactoryContract = await ethers.getContractAt(
    factory_abi,
    FACTORY_CONTRACT_ADDRESS
  );

  const addresses = [
    "0x1111111111111111111111111111111111111111",
    "0x2222222222222222222222222222222222222222",
    "0x3333333333333333333333333333333333333333",
    "0x4444444444444444444444444444444444444444",
    "0x089244FFCd2e346FD64FaA873d824dAA33258A6A",
    "0x0f09D1Fb501041E32170b1B759f1b2ef6349C490",
    "0x5555555444444444444444444444444444444445",
  ];
  const { rootHash, output } = generateMerkleTreeFromAddresses(addresses);
  console.log(output);
  const name = "SonicDash25";
  const symbol = "SDA";
  const baseURI =
    "ipfs://bafkreidolt4hcw7zbo2cp745g3zyommfz4e43g4pgdevu4ade2ujp2vgma";
  const merkleRoot = rootHash;
  const nftAddress = ethers.ZeroAddress;
  const noOfClaimers = addresses.length;

  const tx = await poapFactoryContract[
    "createSonikPoap(string,string,string,bytes32,address,uint256)"
  ](name, symbol, baseURI, merkleRoot, nftAddress, noOfClaimers);

  const reciept = await tx.wait();
  if (reciept.status === 1) {
    console.log("POAP Creation Successful!");
    // console.log(reciept);
    // Find the emitted event with the new contract's address
    const eventLogs = reciept.logs;
    
    if (eventLogs) {
      const deployedContractAddress = eventLogs[0].topics[3];
      console.log(
        "poap address: -> ",
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
