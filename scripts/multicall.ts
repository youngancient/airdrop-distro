import { ethers } from "hardhat";

async function main() {
    const [signer] = await ethers.getSigners();
    
  const FACTORY_CONTRACT_ADDRESS = "0x04f0985918eE7E6B9DB2D216ce359d8c9a3A313A";
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
  const allDropAddresses = await poapFactoryContract.getAllSonikPoapClones();

  const MULTICALL3_ABI = [
    "function tryAggregate(bool requireSuccess, tuple(address target, bytes callData)[] calls) payable returns (tuple(bool success, bytes returnData)[] returnData)",
  ];
  const MULTICALL3_ADDRESS = "0x84Fef3F2eb720ae467Ee75B4A03Ce665831965B6";

  const multicallContract = await ethers.getContractAt(
    MULTICALL3_ABI,
    MULTICALL3_ADDRESS
  );

  const POAP_AIRDROP_ABI = [
    "function getPoapInfo(address user) view returns (string _baseURI, string name, address creatorAddress, uint256 totalClaimed, uint256 totalClaimable, uint256 pectanageClaimed, uint256 _creationTime, bool _hasUserClaimedAirdrop)"
];

  const iface = new ethers.Interface(POAP_AIRDROP_ABI);

  interface Call {
    target: string;
    callData: string;
  }

  const calls: Call[] = allDropAddresses.map(
    (addr: string): Call => ({
      target: addr,
      callData: iface.encodeFunctionData("getPoapInfo",[signer.address]),
    })
  );

  const results = await multicallContract.tryAggregate.staticCall(true, calls);

//   console.log(results);
  // Decode results
    interface DecodedResult {
      address: string;
      baseURI: string;
      name: string;
      creatorAddress: string;
      totalClaimed: string;
      totalClaimable: string;
      percentageClaimed: string;
      creationTime: number;
      hasUserClaimed : boolean;
    }

    interface Result {
      success: boolean;
      returnData: string;
    }

    const decoded: (DecodedResult | null)[] = results.map((res: Result, idx: number): DecodedResult | null => {
      if (!res.success) {
        console.warn(`Call failed for address: ${allDropAddresses[idx]}`);
        return null;
      }

      const [
        baseURI,
        name,
        creatorAddress,
        totalClaimed,
        totalClaimable,
        percentageClaimed,
        creationTime,
        hasUserClaimed,
      ] = iface.decodeFunctionResult("getPoapInfo", res.returnData);

      return {
        address: allDropAddresses[idx],
        baseURI,
        name,
        creatorAddress,
        totalClaimed: totalClaimed.toString(),
        totalClaimable: totalClaimable.toString(),
        percentageClaimed: percentageClaimed.toString(),
        creationTime: Number(creationTime),
        hasUserClaimed
      };
    });

    console.log(decoded);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
