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

  const POAP_CONTRACT_ADDRESS = "0x90b1fca36a2754f12f43b0061a93c8c76f082964";
  const [signer] = await ethers.getSigners();

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
    '0x708e7cb9a75ffb24191120fba1c3001faa9078147150c6f2747569edbadee751',
    '0x8cdd6608c14a222369d97956b504f94500a33c673fd156f8f2da7f980260c91c',
    '0x79ec436321e0ee4d3657f6b4c44573e6af12266adc6fdb29f3f7de915ce4975d'
  ];

  // Call the checkEligibility function
  const isEligible = await poapContract.checkEligibility(merkleProof);
  console.log("Eligibility:", isEligible);

  // call claim tx
  const message = `Claim POAP for ${signer.address}`;
  const msgBytes = ethers.toUtf8Bytes(message);
  const digest = ethers.keccak256(msgBytes);

  const wallet = new ethers.Wallet(process.env.ACCOUNT_PRIVATE_KEY!);

  const sig = wallet.signingKey.sign(digest);

  // const signature = await signer.signMessage(digest);
  const signature = ethers.concat([sig.r, sig.s, ethers.toBeHex(sig.v, 1)]);

  console.log("signature -> ", signature);

  const tx = await poapContract["claimAirdrop(bytes32[],bytes32,bytes)"](
    merkleProof,
    digest,
    signature
  );
  await tx.wait();

  console.log("Claim successful!");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
