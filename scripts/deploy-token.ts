import { ethers } from "hardhat";

async function main() {
  console.log("Deploying ConfidentialToken contract...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  // Token parameters
  const name = process.env.TOKEN_NAME || "Scuttle Token";
  const symbol = process.env.TOKEN_SYMBOL || "SCT";
  const decimals = parseInt(process.env.TOKEN_DECIMALS || "18");
  const totalSupply = ethers.parseUnits(process.env.TOKEN_SUPPLY || "1000000", decimals);
  const encryptSupply = process.env.ENCRYPT_SUPPLY === "true";

  console.log("\nToken parameters:");
  console.log("- Name:", name);
  console.log("- Symbol:", symbol);
  console.log("- Decimals:", decimals);
  console.log("- Total Supply:", ethers.formatUnits(totalSupply, decimals));
  console.log("- Encrypt Supply:", encryptSupply);

  const ConfidentialToken = await ethers.getContractFactory("ConfidentialToken");
  const token = await ConfidentialToken.deploy(
    name,
    symbol,
    decimals,
    totalSupply,
    encryptSupply
  );

  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();

  console.log("\n✅ ConfidentialToken deployed to:", tokenAddress);
  console.log("\nSave this information:");
  console.log("Contract Address:", tokenAddress);
  console.log("Owner:", deployer.address);
  console.log("Network:", (await ethers.provider.getNetwork()).name);
  console.log("\nVerify on Etherscan:");
  console.log(`npx hardhat verify --network sepolia ${tokenAddress} "${name}" "${symbol}" ${decimals} ${totalSupply} ${encryptSupply}`);

  return { token, tokenAddress, deployer: deployer.address };
}

main()
  .then(({ tokenAddress }) => {
    console.log("\n🎉 Deployment successful!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  });
