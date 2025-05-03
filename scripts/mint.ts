import { ethers } from "hardhat";

async function main() {
  const POAP_ABI = [
    "function checkEligibility(bytes32[] _merkleProof) view returns (bool)",
    "function claimAirdrop(bytes32[] _merkleProof, bytes32 digest, bytes signature)",
    "function claimAirdrop(bytes32[] _merkleProof, uint256 _tokenId, bytes32 digest, bytes signature)",
    "function getPoapInfo() view returns (string _baseURI, string name, address creatorAddress, uint256 totalClaimed, uint256 totalClaimable, uint256 pectanageClaimed, uint256 _creationTime)",
    "function getPercentage(uint256 x, uint256 y) pure returns (uint256)",
    "function hasAirdropTimeEnded() view returns (bool)",
    "function updateNftRequirement(address _newNft)",
    "function toggleNftRequirement()",
    "function updateClaimTime(uint256 _claimTime)",
    "function tokenURI(uint256 tokenId) view returns (string)",
    "function supportsInterface(bytes4 interfaceId) view returns (bool)",
  ];

  const POAP_CONTRACT_ADDRESS = "0xe027a186136c8d7a27a2a9f2a78c0df58c742e61";

  const poapContract = await ethers.getContractAt(
    POAP_ABI,
    POAP_CONTRACT_ADDRESS
  );

  //   //   let's test with a get function
  const poapInfo = await poapContract.getPoapInfo();
  console.log("POAP Info ->>>>>>>>");
  console.log({ poapInfo });
  // ->>>>>>>>> works!

  //   let's make a claim tx
  const merkleProof = [
    '0xa7409058568815d08a7ad3c7d4fd44cf1dec90c620cb31e55ad24c654f7ba34f',
    '0xcef861ae49469220eac9703d1077fa45b0a3ae990e4a8a7d325472f93cbca30e',
    '0x342fe9e468d733b47cb9a9ef127d55cf1f280f4c19efe6596ecf8e40d1e0fb39'
  ];

  // Call the checkEligibility function
  const isEligible = await poapContract.checkEligibility(merkleProof);
  console.log("Eligibility:", isEligible);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
