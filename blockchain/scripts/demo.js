const hre = require("hardhat");

async function main() {
  console.log("==============================================================");
  console.log(" CleanTO (Warm Editorial Fintech) - Smart Contract Ledger Demo");
  console.log(" Contract: CleanTORewards (Ownership & Authorized Recorder)");
  console.log("==============================================================\n");

  const [owner, backendRecorder, contributor, hacker] = await hre.ethers.getSigners();
  console.log(`Contract Owner (Admin):    ${owner.address}`);
  console.log(`Backend Service (Recorder): ${backendRecorder.address}`);
  console.log(`Contributor (Citizen):      ${contributor.address}`);
  console.log(`Unauthorized Account:       ${hacker.address}\n`);

  // 1. Deploy CleanTORewards contract
  console.log("1. Deploying CleanTORewards to local in-process network...");
  const CleanTORewards = await hre.ethers.getContractFactory("CleanTORewards");
  const contract = await CleanTORewards.deploy();
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  console.log(`   [SUCCESS] CleanTORewards deployed at: ${contractAddress}\n`);

  // 2. Set backend authority
  console.log("2. Authorizing Backend Service address to record verified cleanups...");
  const authTx = await contract.setAuthorizedRecorder(backendRecorder.address);
  await authTx.wait();
  console.log(`   [SUCCESS] Authorized recorder set to: ${backendRecorder.address}\n`);

  // 3. Query initial balance
  let balance = await contract.balanceOf(contributor.address);
  console.log(`3. Initial CleanTO balance for contributor: ${balance.toString()} CleanTO\n`);

  // 4. Test security: verify unauthorized caller is rejected
  console.log("4. Testing Security: Unauthorized account attempts to mint CleanTO...");
  try {
    await contract.connect(hacker).recordCleanup(contributor.address, 100);
    console.log("   [ERROR] Unauthorized mint succeeded unexpectedly!");
  } catch (err) {
    console.log(`   [SECURITY PASS] Rejected unauthorized caller with message:\n   "${err.message.split("\n")[0]}"\n`);
  }

  // 5. Authorized backend records verified cleanup
  const cleanupScore = 92;
  console.log(`5. Authorized Backend records verified cleanup (Score: ${cleanupScore})...`);
  const recordTx = await contract.connect(backendRecorder).recordCleanup(contributor.address, cleanupScore);
  const receipt = await recordTx.wait();
  console.log(`   [SUCCESS] Transaction mined in block #${receipt.blockNumber}`);
  console.log(`   Transaction Hash: ${receipt.hash}\n`);

  // 6. Query updated balance
  balance = await contract.balanceOf(contributor.address);
  const count = await contract.cleanupCount(contributor.address);
  const total = await contract.totalIssued();
  console.log("6. Verified Final Ledger State:");
  console.log(`   - Contributor Balance:  ${balance.toString()} CleanTO`);
  console.log(`   - Cleanups Recorded:    ${count.toString()}`);
  console.log(`   - Total CleanTO Issued: ${total.toString()}`);

  console.log("\n==============================================================");
  console.log(" Smart Contract Demonstration Completed Successfully!");
  console.log("==============================================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
