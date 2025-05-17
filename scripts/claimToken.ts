import axios from "axios";
import { ethers } from "hardhat";

// gotten from -> https://api.coingecko.com/api/v3/coins/list
const nativeTokenMap: Record<number, { name: string; token: string }> = {
  1: { name: "ethereum", token: "ETH" }, // mainnet
  11155111: { name: "ethereum", token: "ETH" }, // testnet
  84532: { name: "base", token: "ETH" }, // testnet (example)
  57054: { name: "sonic-3", token: "S" }, // testnet
  1001: { name: "kaia", token: "KAIA" }, // testnet
};

async function estimateGasCostInNativeTokenAndUSD(
  gas: bigint
): Promise<{ native: string; usd: string; nativeWithToken: string }> {
  const feeData = await ethers.provider.getFeeData();
  const gasPrice = feeData.gasPrice ?? ethers.parseUnits("1", "gwei");
  const gasCostWei = gas * gasPrice;
  const gasCostNativeRaw = ethers.formatEther(gasCostWei);
  const gasCostNativeAprox = Number(gasCostNativeRaw).toFixed(4);

  const chainId = (await ethers.provider.getNetwork()).chainId;
  const coingeckoTokenId = nativeTokenMap[Number(chainId)]?.name;

  if (!coingeckoTokenId) throw new Error(`Unsupported chainId: ${chainId}`);

  let gasCostUsd = "N/A"; // default val
  try {
    const res = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoTokenId}&vs_currencies=usd`
    );
    const usdRate = res.data[coingeckoTokenId]?.usd ?? 0;
    gasCostUsd = (parseFloat(gasCostNativeRaw) * usdRate).toFixed(4);
  } catch (error) {
    console.error("Error fetching USD rate from CoinGecko:", error);
  }

  const nativeTokenSymbol = nativeTokenMap[Number(chainId)]?.token;
  const gasCostNativeWithToken = `${gasCostNativeAprox}${nativeTokenSymbol}`;

  return {
    native: gasCostNativeAprox,
    usd: `$${gasCostUsd}`,
    nativeWithToken: gasCostNativeWithToken, // Include native token
  };"claimAirdrop(bytes32[])"
}

async function main() {
  const TOKEN_AIRDROP_ABI = [
    // Read/view functions
    "function merkleRoot() view returns (bytes32)",
    "function creationTime() view returns (uint256)",
    "function name() view returns (string)",
    "function owner() view returns (address)",
    "function tokenAddress() view returns (address)",
    "function nftAddress() view returns (address)",
    "function isTimeLocked() view returns (bool)",
    "function hasOwnerWithdrawn() view returns (bool)",
    "function hasUserClaimedAirdrop(address user) view returns (bool)",
    "function hasAirdropTimeEnded() view returns (bool)",
    "function getContractBalance() view returns (uint256)",
    "function checkEligibility(uint256 _amount, bytes32[] calldata _merkleProof) view returns (bool)",
    "function totalOutputTokens() view returns (uint256)",
    `function getDropInfo(address user) view returns (
     string _name,
     address creatorAddress,
     uint256 totalClaimed,
     uint256 totalClaimable,
     uint256 totalClaimedtoken,
     uint256 totalClaimabletoken,
     uint256 _creationTime,
     uint256 _endtime,
     bool _hasOwnerWithdrawn,
     bool _hasUserClaimedAirdrop,
     address _nftAddress
   )`,

    // Write/public/external functions
    "function claimAirdrop(uint256 _amount, bytes32[] calldata _merkleProof) external",
    "function claimAirdrop(uint256 _amount, bytes32[] calldata _merkleProof, uint256 _tokenId) public",
    "function withdrawLeftOverToken() external",
    "function fundAirdrop(uint256 _amount) external",
    "function updateNftRequirement(address _newNft) external",
    "function turnOffNftRequirement() external",
    "function updateClaimTime(uint256 _claimTime) external",
  ];

  const TOKEN_DROP_CONTRACT_ADDRESS =
    "0x047fa1e817831e661212df6cd9937bc3b503b61c";
  const [signer] = await ethers.getSigners();

  const tokenDropContract = await ethers.getContractAt(
    TOKEN_AIRDROP_ABI,
    TOKEN_DROP_CONTRACT_ADDRESS
  );

  //   //   let's test with a get function
  const tokenDropInfo = await tokenDropContract.getDropInfo(signer.address);
  console.log("POAP Info ->>>>>>>>", tokenDropInfo);

  // ->>>>>>>>> works!

  //   let's make a claim tx
  const amount = "310000000000000000000";
  const merkleProof = [
    "0xb5dedb24676b0a29ce0be50a25fa07f3dcc44b4eac2ae9516982fdc9a3c1ba34",
    "0xb78af4f822d074f3ad6e6f0021118589f4bfce1e98f23121c01cd5623ccb8d84",
  ];

  // Call the checkEligibility function
  const isEligible = await tokenDropContract.checkEligibility(
    amount,
    merkleProof
  );
  console.log("Eligibility:", isEligible);

  // // call claim tx

  const gas = await tokenDropContract[
    "claimAirdrop(uint256,bytes32[])"
  ].estimateGas(amount, merkleProof);

  const { native, usd, nativeWithToken } =
    await estimateGasCostInNativeTokenAndUSD(gas);

  console.log("gas ", gas.toString());
  console.log("gas cost -> ", native);
  console.log("gas cost -> ", nativeWithToken);
  console.log("usd val -> ", usd);

  const tx = await tokenDropContract["claimAirdrop(uint256,bytes32[])"](
    amount,
    merkleProof
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
