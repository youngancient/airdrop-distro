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

      console.log("merkle root: " + roothash);

      // Example leaf to test proof
      const targetData = {
        address: "0xa6B1feB40D1c8eeAD5AFD6f7372E02B637F142FA",
        amount: "1800",
      };
      console.log("User claim: " + targetData.address, targetData.amount);
      const targetLeaf = hashData(targetData);
      const leafProof = tree.getHexProof(targetLeaf);

      // console.log(leafProof);
      // Verify the proof
      const isValid = tree.verify(leafProof, targetLeaf, roothash);
      console.log("Is Proof is valid? :", isValid);

      const targetData2 = {
        address: "0xa6B1feB40D1c8eeAD5AFD6f7372E02B637F142FA",
        amount: "100",
      };
      console.log("User claim: " + targetData2.address, targetData2.amount);

      const targetLeaf2 = hashData(targetData2);

      const leafProof2 = tree.getHexProof(targetLeaf2);

      const isValid2 = tree.verify(leafProof2, targetLeaf2, roothash);

      console.log("Is Proof is valid? :", isValid2);
    });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
