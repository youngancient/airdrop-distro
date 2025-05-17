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
  };
}

async function main() {
  const POAP_ABI = [
    "function checkEligibility(bytes32[] _merkleProof) view returns (bool)",
    "function claimAirdrop(bytes32[] _merkleProof)",
    "function claimAirdrop(bytes32[] _merkleProof, uint256 _tokenId)",
    "function getPoapInfo(address user) view returns (string _baseURI, string name, address creatorAddress, uint256 totalClaimed, uint256 totalClaimable, uint256 _creationTime, uint256 _endTime, bool _hasUserClaimedAirdrop, address _nftAddress)",
    "function getPercentage(uint256 x, uint256 y) pure returns (uint256)",
    "function hasAirdropTimeEnded() view returns (bool)",
    "function updateNftRequirement(address _newNft)",
    "function toggleNftRequirement()",
    "function updateClaimTime(uint256 _claimTime)",
    "function tokenURI(uint256 tokenId) view returns (string)",
    "function supportsInterface(bytes4 interfaceId) view returns (bool)",
  ];

  const POAP_CONTRACT_ADDRESS = "0x91a4e5ac874e56b453a802a6aabe56572028e126";
  const [signer] = await ethers.getSigners();

  const poapContract = await ethers.getContractAt(
    POAP_ABI,
    POAP_CONTRACT_ADDRESS
  );

  //   //   let's test with a get function
  const poapInfo = await poapContract.getPoapInfo(signer.address);
  console.log("POAP Info ->>>>>>>>", poapInfo);

  // ->>>>>>>>> works!

  //   let's make a claim tx
  const merkleProof = [
    "0x708e7cb9a75ffb24191120fba1c3001faa9078147150c6f2747569edbadee751",
    "0x8cdd6608c14a222369d97956b504f94500a33c673fd156f8f2da7f980260c91c",
    "0x79ec436321e0ee4d3657f6b4c44573e6af12266adc6fdb29f3f7de915ce4975d",
  ];

  // Call the checkEligibility function
  const isEligible = await poapContract.checkEligibility(merkleProof);
  console.log("Eligibility:", isEligible);

  // call claim tx

  const gas = await poapContract["claimAirdrop(bytes32[])"].estimateGas(
    merkleProof
  );

  const { native, usd, nativeWithToken } =
    await estimateGasCostInNativeTokenAndUSD(gas);

  console.log("gas ", gas.toString());
  console.log("gas cost -> ", native);
  console.log("gas cost -> ", nativeWithToken);
  console.log("usd val -> ", usd);

  const tx = await poapContract["claimAirdrop(bytes32[])"](merkleProof);
  await tx.wait();
  console.log("Claim successful!");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
