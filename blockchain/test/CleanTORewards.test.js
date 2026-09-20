const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CleanTORewards Contract", function () {
  let CleanTORewards;
  let contract;
  let owner;
  let recorder;
  let contributor;
  let unauthorizedUser;

  beforeEach(async function () {
    [owner, recorder, contributor, unauthorizedUser] = await ethers.getSigners();
    CleanTORewards = await ethers.getContractFactory("CleanTORewards");
    contract = await CleanTORewards.deploy();
    await contract.waitForDeployment();
  });

  it("should deploy with owner as initial recorder", async function () {
    expect(await contract.owner()).to.equal(owner.address);
    expect(await contract.authorizedRecorder()).to.equal(owner.address);
    expect(await contract.balanceOf(contributor.address)).to.equal(0);
  });

  it("should record a cleanup and credit CleanTO balance when called by owner", async function () {
    const score = 88;
    const tx = await contract.recordCleanup(contributor.address, score);
    await tx.wait();

    expect(await contract.balanceOf(contributor.address)).to.equal(score);
    expect(await contract.cleanupCount(contributor.address)).to.equal(1);
    expect(await contract.totalIssued()).to.equal(score);
  });

  it("should emit CleanupRewardRecorded event on recording", async function () {
    const score = 92;
    await expect(contract.recordCleanup(contributor.address, score))
      .to.emit(contract, "CleanupRewardRecorded")
      .withArgs(contributor.address, score, score, score, (val) => val > 0);
  });

  it("should revert if called by an unauthorized address", async function () {
    await expect(
      contract.connect(unauthorizedUser).recordCleanup(contributor.address, 75)
    ).to.be.revertedWith("CleanTORewards: caller is not authorized to record cleanups");
  });

  it("should revert if user is zero address", async function () {
    await expect(
      contract.recordCleanup(ethers.ZeroAddress, 75)
    ).to.be.revertedWith("CleanTORewards: cannot reward the zero address");
  });

  it("should allow owner to assign a new authorized recorder and let recorder record cleanups", async function () {
    await contract.setAuthorizedRecorder(recorder.address);
    expect(await contract.authorizedRecorder()).to.equal(recorder.address);

    const score = 95;
    await contract.connect(recorder).recordCleanup(contributor.address, score);
    expect(await contract.balanceOf(contributor.address)).to.equal(score);
  });
});
