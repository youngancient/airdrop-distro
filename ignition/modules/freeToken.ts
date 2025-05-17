import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const name = "FreeToken";
const symbol = "FTK";
//redeploy

const FreeTokenModule = buildModule("FreeTokenModule", (m) => {

  const freeToken = m.contract("FreeToken",[name, symbol]);

  return { freeToken };
});

export default FreeTokenModule;
