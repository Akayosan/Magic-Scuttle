import hre from "hardhat";
const { ethers } = hre;

async function main() {
  console.log("🚀 Deploying NFT contracts to Sepolia...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH\n");

  // Step 1: Deploy ConfidentialERC721
  console.log("📝 Step 1: Deploying ConfidentialERC721...");
  const collectionName = "Scuttle NFT Collection";
  const collectionSymbol = "SNFT";
  const baseURI = "ipfs://";
  const maxSupply = 10000;
  const royaltyBasisPoints = 500; // 5% royalty
  const mintPrice = ethers.parseEther("0.001"); // 0.001 ETH mint price

  const ConfidentialERC721 = await ethers.getContractFactory("ConfidentialERC721");
  const nft = await ConfidentialERC721.deploy(
    collectionName,
    collectionSymbol,
    baseURI,
    maxSupply,
    royaltyBasisPoints,
    mintPrice
  );

  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();
  console.log("✅ ConfidentialERC721 deployed to:", nftAddress);

  // Step 2: Deploy ConfidentialMarketplace
  console.log("\n📝 Step 2: Deploying ConfidentialMarketplace...");
  const platformFeeBasisPoints = 250; // 2.5% platform fee

  const ConfidentialMarketplace = await ethers.getContractFactory("ConfidentialMarketplace");
  const marketplace = await ConfidentialMarketplace.deploy(platformFeeBasisPoints);

  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("✅ ConfidentialMarketplace deployed to:", marketplaceAddress);

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 NFT DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("\nConfidentialERC721 Contract:");
  console.log("  Address:", nftAddress);
  console.log("  Name:", collectionName);
  console.log("  Symbol:", collectionSymbol);
  console.log("  Max Supply:", maxSupply);
  console.log("  Royalty:", royaltyBasisPoints / 100, "%");
  console.log("  Mint Price:", ethers.formatEther(mintPrice), "ETH");

  console.log("\nConfidentialMarketplace Contract:");
  console.log("  Address:", marketplaceAddress);
  console.log("  Platform Fee:", platformFeeBasisPoints / 100, "%");

  console.log("\nDeployer:", deployer.address);
  console.log("Network:", (await ethers.provider.getNetwork()).name);
  
  console.log("\n" + "=".repeat(60));
  console.log("📋 Next Steps:");
  console.log("=".repeat(60));
  console.log("1. Verify contracts on Etherscan:");
  console.log(`   npx hardhat verify --network sepolia ${nftAddress} "${collectionName}" "${collectionSymbol}" "${baseURI}" ${maxSupply} ${royaltyBasisPoints} "${mintPrice}"`);
  console.log(`   npx hardhat verify --network sepolia ${marketplaceAddress} ${platformFeeBasisPoints}`);
  console.log("2. Update frontend with contract addresses");
  console.log("3. Mint test NFTs");
  console.log("4. List NFTs on marketplace");
  console.log("=".repeat(60) + "\n");

  // Save deployment info
  const deploymentInfo = {
    network: "sepolia",
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      nft: {
        address: nftAddress,
        name: collectionName,
        symbol: collectionSymbol,
        baseURI,
        maxSupply,
        royaltyBasisPoints,
        mintPrice: mintPrice.toString(),
      },
      marketplace: {
        address: marketplaceAddress,
        platformFeeBasisPoints,
      },
    },
  };

  // Save to file
  const fs = await import("fs");
  const path = await import("path");
  
  const deploymentsDir = path.join(process.cwd(), "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const filename = `sepolia-nft-${Date.now()}.json`;
  fs.writeFileSync(
    path.join(deploymentsDir, filename),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log(`💾 Deployment info saved to: deployments/${filename}\n`);

  return deploymentInfo;
}

main()
  .then(() => {
    console.log("✨ NFT deployment completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ NFT deployment failed:", error);
    process.exit(1);
  });
