import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const tokenAddress = "0x669eEe68Ef39E12D1b38d1f274BFc9aC46D771CB";
const merkleRoot = "0xc2635d49a927cf06ff1e8646a3c4d2d6808947f771c7faebe4b63b09df24b449";

const MerkleAirdropModule = buildModule("MerkleAirdropModule", (m) => {

  const airdrop = m.contract("MerkleAirdrop",[tokenAddress, merkleRoot]);

  return { airdrop };
});

export default MerkleAirdropModule;
