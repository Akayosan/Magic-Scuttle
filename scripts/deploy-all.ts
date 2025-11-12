import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying all contracts to Sepolia...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH\n");

  // Step 1: Deploy Token
  console.log("📝 Step 1: Deploying ConfidentialToken...");
  const tokenName = "Scuttle Token";
  const tokenSymbol = "SCT";
  const tokenDecimals = 18;
  const tokenSupply = ethers.parseUnits("1000000", tokenDecimals);
  const encryptSupply = true;

  const ConfidentialToken = await ethers.getContractFactory("ConfidentialToken");
  const token = await ConfidentialToken.deploy(
    tokenName,
    tokenSymbol,
    tokenDecimals,
    tokenSupply,
    encryptSupply
  );

  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("✅ Token deployed to:", tokenAddress);

  // Step 2: Deploy Presale
  console.log("\n📝 Step 2: Deploying ConfidentialPresale...");
  const rate = ethers.parseUnits("1000", 18); // 1000 tokens per ETH
  const hardCap = ethers.parseEther("100"); // 100 ETH
  const softCap = ethers.parseEther("10"); // 10 ETH
  const minContribution = ethers.parseEther("0.01"); // 0.01 ETH
  const maxContribution = ethers.parseEther("10"); // 10 ETH
  const startTime = Math.floor(Date.now() / 1000);
  const endTime = startTime + (7 * 24 * 60 * 60); // 7 days
  const isEncrypted = true;

  const ConfidentialPresale = await ethers.getContractFactory("ConfidentialPresale");
  const presale = await ConfidentialPresale.deploy(
    tokenAddress,
    rate,
    hardCap,
    softCap,
    minContribution,
    maxContribution,
    startTime,
    endTime,
    isEncrypted
  );

  await presale.waitForDeployment();
  const presaleAddress = await presale.getAddress();
  console.log("✅ Presale deployed to:", presaleAddress);

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("\nToken Contract:");
  console.log("  Address:", tokenAddress);
  console.log("  Name:", tokenName);
  console.log("  Symbol:", tokenSymbol);
  console.log("  Supply:", ethers.formatUnits(tokenSupply, tokenDecimals));
  console.log("  Encrypted:", encryptSupply);

  console.log("\nPresale Contract:");
  console.log("  Address:", presaleAddress);
  console.log("  Rate:", ethers.formatUnits(rate, 18), "tokens/ETH");
  console.log("  Hard Cap:", ethers.formatEther(hardCap), "ETH");
  console.log("  Soft Cap:", ethers.formatEther(softCap), "ETH");
  console.log("  Duration:", "7 days");
  console.log("  Encrypted:", isEncrypted);

  console.log("\nDeployer:", deployer.address);
  console.log("Network:", (await ethers.provider.getNetwork()).name);
  
  console.log("\n" + "=".repeat(60));
  console.log("📋 Next Steps:");
  console.log("=".repeat(60));
  console.log("1. Approve presale contract to spend tokens");
  console.log("2. Transfer tokens to presale contract");
  console.log("3. Verify contracts on Etherscan:");
  console.log(`   npx hardhat verify --network sepolia ${tokenAddress}`);
  console.log(`   npx hardhat verify --network sepolia ${presaleAddress}`);
  console.log("4. Update frontend with contract addresses");
  console.log("=".repeat(60) + "\n");

  // Save deployment info to file
  const deploymentInfo = {
    network: "sepolia",
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      token: {
        address: tokenAddress,
        name: tokenName,
        symbol: tokenSymbol,
        decimals: tokenDecimals,
        totalSupply: tokenSupply.toString(),
        isSupplyEncrypted: encryptSupply,
      },
      presale: {
        address: presaleAddress,
        tokenAddress,
        rate: rate.toString(),
        hardCap: hardCap.toString(),
        softCap: softCap.toString(),
        minContribution: minContribution.toString(),
        maxContribution: maxContribution.toString(),
        startTime,
        endTime,
        isEncrypted,
      },
    },
  };

  const fs = require("fs");
  const path = require("path");
  
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const filename = `sepolia-${Date.now()}.json`;
  fs.writeFileSync(
    path.join(deploymentsDir, filename),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log(`💾 Deployment info saved to: deployments/${filename}\n`);

  return deploymentInfo;
}

main()
  .then(() => {
    console.log("✨ All deployments completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  });
