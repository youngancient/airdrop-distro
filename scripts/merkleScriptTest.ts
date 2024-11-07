import { ethers } from "hardhat";
import MerkleTree from "merkletreejs";
import path from "path";
import csvParser from "csv-parser";
const fs = require("fs");
import keccak256 from "keccak256";
import { AirdropEntity, generateMerkleTree } from "./merkleScript";

async function main() {
  const entities: AirdropEntity[] = [
    { address: "0x99cb7f24da7f4bf494bb9740a3ff46d07bee1525", amount: "50000000000000000000" },
    { address: "0x9a3a60f5aee7aef1fb0d4da8534452a2e2a89d46", amount: "100000000000000000000" },
    { address: "0xf5ab70ada82e7260a4e09d79b8e09bd2fc08970c", amount: "310000000000000000000" },
    { address: "0xc9cd96ce406eeb5b7ccecf19415eb640953ff6a0", amount: "200000000000000000000" },
    { address: "0xfd5671504514c0214dfb30b1d820d71a891af913", amount: "90000000000000000000" },
    { address: "0x14fab7ffc93cecea209cd310a18eb1a760a904a0", amount: "140000000000000000000" },
    { address: "0xa6B1feB40D1c8eeAD5AFD6f7372E02B637F142FA", amount: "1800000000000000000000" },
    { address: "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2", amount: "130000000000000000000" },
    { address: "0xc8211f26bb21afc25bb784208a63d96deaae55cb", amount: "210000000000000000000" },
    { address: "0xf9056af4cd1211dd9638e9979e99a43de830779e", amount: "320000000000000000000" }
  ];

  const { rootHash, proofs } = generateMerkleTree(entities);
  console.log("Merkle Root:", rootHash);

  // Display proofs for each entity
  entities.forEach((entity, index) => {
    console.log(`Entity ${index + 1}:`);
    console.log("Address:", entity.address);
    console.log("Amount:", entity.amount);
    console.log("Proof:", proofs[index]);
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
