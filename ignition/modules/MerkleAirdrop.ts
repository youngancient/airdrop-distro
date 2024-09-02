import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const MerkleAirdropModule = buildModule("MerkleAirdropModule", (m) => {

  const airdrop = m.contract("MerkleAirdrop");

  return { airdrop };
});

export default MerkleAirdropModule;
