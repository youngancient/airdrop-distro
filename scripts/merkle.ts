import { ethers } from "hardhat";
import MerkleTree from "merkletreejs";
import path from "path";
import csvParser from "csv-parser";
const fs = require("fs");
import keccak256 from "keccak256";

// Function to hash data using keccak256
const hashData = (data: object): Buffer => keccak256(JSON.stringify(data));

async function main() {
  // Define the path to the CSV file
  const filePath = path.join(__dirname, "../files/list.csv");

  // array to store the result
  let results: any[] = [];

  // reading from the file into the array
  fs.createReadStream(filePath)
    .pipe(csvParser())
    .on("data", function (data: any) {
      results.push(data);
    })
    .on("end", function () {
      console.log("CSV file successfully processed");
      // convert each record to a string and hash it
      const leaves = results.map((record) => hashData(record));

      // create new merkle tree
      const tree = new MerkleTree(leaves, hashData, {
        sortPairs: true,
      });

      // get merkle root
      const roothash = tree.getHexRoot();

      console.log(roothash);

      // Example leaf to test proof
      const targetData = {
        address: "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2",
        amount: "130",
      };

      const targetLeaf = hashData(targetData);
      const leafProof = tree.getHexProof(targetLeaf);

      console.log(leafProof);
      // Verify the proof
      const isValid = tree.verify(leafProof, targetLeaf, roothash);
      console.log("Proof is valid:", isValid);
    });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
