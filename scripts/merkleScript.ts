import { ethers } from "hardhat";
import MerkleTree from "merkletreejs";
import keccak256 from "keccak256";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";

// make this function modularized
// so that it can be imported in other scripts
// it should take in as argument, an array of Objects which represent each airdrop entity
//[{address : 0xdead, amount : 1000000000000000}, {}]
// should return the root hash of the merkle tree and the proofs for each entity

export interface AirdropEntity {
  address: string;
  amount: string; // use string for large integers to prevent overflow
}




export function generateMerkleTree(entities: AirdropEntity[]) {
  // Create the tree using OpenZeppelin's format
  const tree = StandardMerkleTree.of(
    entities.map((entity) => [entity.address, entity.amount]),
    ["address", "uint256"]
  );

  // Get the root
  const rootHash = tree.root;

  // Generate proofs and final output
  const output = entities.map((entity) => {
    // Find the index of the current entity in the tree
    const index = [...tree.entries()].findIndex(
      ([, value]) =>
        value[0].toLowerCase() === entity.address.toLowerCase() &&
        value[1] === entity.amount
    );

    const proofs = tree.getProof(index);

    return {
      address: entity.address,
      amount: entity.amount,
      proofs,
    };
  });

  // Optional: All proofs in one array if needed (similar to original)
  const proofs = output.map((entry) => entry.proofs);

  return { rootHash, proofs, output };
}

export function generateMerkleTreeFromAddresses(addresses: string[]) {
  // Convert addresses to OpenZeppelin-compatible entries: [ [address], [address], ... ]
  const values = addresses.map((addr) => [addr]);

  // Define value types for each field
  const tree = StandardMerkleTree.of(values, ["address"]);

  const rootHash = tree.root;

  // Map each address to its corresponding proof
  const output = addresses.map((address) => {
    // Find the index of this address in the tree
    const index = [...tree.entries()].findIndex(
      ([, value]) => value[0].toLowerCase() === address.toLowerCase()
    );

    const proofs = tree.getProof(index);

    return {
      address,
      proofs
    };
  });

  return { rootHash, output };
}


// export function generateMerkleTree(entities: AirdropEntity[]) {
//   // Generate leaf nodes
//   const leaves = entities.map((entity) =>
//     keccak256(
//       ethers.solidityPacked(
//         ["address", "uint256"],
//         [entity.address, entity.amount]
//       )
//     )
//   );

//   // Create the Merkle Tree
//   const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });

//   // Get the Merkle Root
//   const rootHash = tree.getHexRoot();

//   // Generate proofs for each entity
//   const proofs = entities.map((entity) => {
//     const leaf = keccak256(
//       ethers.solidityPacked(
//         ["address", "uint256"],
//         [entity.address, entity.amount]
//       )
//     );
//     return tree.getHexProof(leaf);
//   });

//   // Generate output which combines proof, amount and merkle proof for each entity
//   const output = entities.map((entity, index) => {
//     const leaf = leaves[index];
//     return {
//       address: entity.address,
//       amount: entity.amount,
//       proofs: tree.getHexProof(leaf),
//     };
//   });

//   return { rootHash, proofs, output };
// }

// export function generateMerkleTreeFromAddresses(addresses: string[]) {
//   // Generate leaf nodes (hash only the address)
//   const leaves = addresses.map((address) =>
//     keccak256(ethers.solidityPacked(["address"], [address]))
//   );

//   // Create the Merkle Tree
//   const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });

//   // Get the Merkle Root
//   const rootHash = tree.getHexRoot();

//   // Generate output which includes address and proof
//   const output = addresses.map((address, index) => {
//     const leaf = leaves[index];
//     return {
//       address,
//       proofs: tree.getHexProof(leaf),
//     };
//   });

//   // the tree is not to be returned normally, it is returned here for test purposes

//   return { rootHash, output, tree };
// }