import { ethers } from "hardhat";

async function main() {
  console.log("Deploying ConfidentialPresale contract...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  // Presale parameters
  const tokenAddress = process.env.TOKEN_ADDRESS || "";
  if (!tokenAddress) {
    throw new Error("TOKEN_ADDRESS environment variable is required");
  }

  const rate = ethers.parseUnits(process.env.PRESALE_RATE || "1000", 18); // Tokens per ETH
  const hardCap = ethers.parseEther(process.env.HARD_CAP || "100"); // 100 ETH
  const softCap = ethers.parseEther(process.env.SOFT_CAP || "10"); // 10 ETH
  const minContribution = ethers.parseEther(process.env.MIN_CONTRIBUTION || "0.01"); // 0.01 ETH
  const maxContribution = ethers.parseEther(process.env.MAX_CONTRIBUTION || "10"); // 10 ETH
  
  const startTime = process.env.START_TIME 
    ? parseInt(process.env.START_TIME)
    : Math.floor(Date.now() / 1000);
  
  const duration = parseInt(process.env.DURATION || "604800"); // 7 days default
  const endTime = startTime + duration;
  
  const isEncrypted = process.env.ENCRYPT_CONTRIBUTIONS === "true";

  console.log("\nPresale parameters:");
  console.log("- Token Address:", tokenAddress);
  console.log("- Rate:", ethers.formatUnits(rate, 18), "tokens per ETH");
  console.log("- Hard Cap:", ethers.formatEther(hardCap), "ETH");
  console.log("- Soft Cap:", ethers.formatEther(softCap), "ETH");
  console.log("- Min Contribution:", ethers.formatEther(minContribution), "ETH");
  console.log("- Max Contribution:", ethers.formatEther(maxContribution), "ETH");
  console.log("- Start Time:", new Date(startTime * 1000).toISOString());
  console.log("- End Time:", new Date(endTime * 1000).toISOString());
  console.log("- Encrypted Contributions:", isEncrypted);

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

  console.log("\n✅ ConfidentialPresale deployed to:", presaleAddress);
  console.log("\nSave this information:");
  console.log("Contract Address:", presaleAddress);
  console.log("Token Address:", tokenAddress);
  console.log("Owner:", deployer.address);
  console.log("Network:", (await ethers.provider.getNetwork()).name);
  console.log("\nVerify on Etherscan:");
  console.log(`npx hardhat verify --network sepolia ${presaleAddress} "${tokenAddress}" ${rate} ${hardCap} ${softCap} ${minContribution} ${maxContribution} ${startTime} ${endTime} ${isEncrypted}`);

  return { presale, presaleAddress, deployer: deployer.address };
}

main()
  .then(({ presaleAddress }) => {
    console.log("\n🎉 Deployment successful!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  });
