const { inputToConfig } = require("@ethereum-waffle/compiler");
const { assert, expect } = require("chai");
const { getNamedAccounts, network, deployments, ethers } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Manual Token Unit Tests", function () {
      let manualToken, deployer;

      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        receiver1 = (await getNamedAccounts()).receiver1;
        receiver2 = (await getNamedAccounts()).receiver2;
        await deployments.fixture(["all"]);
        manualToken = await ethers.getContract("ManualToken", deployer);
        manualTokenReceiver1 = await ethers.getContract(
          "ManualToken",
          receiver1
        );
        manualTokenReceiver2 = await ethers.getContract(
          "ManualToken",
          receiver2
        );
      });

      describe("Constructor", function () {
        it("UT1: Initializes ManualToken correctly", async function () {
          const totalSupply = await manualToken.totalSupply();
          const owner = await manualToken.getOwner();
          const startingBalance = await manualToken.balanceOf(deployer);

          assert.equal(totalSupply.toString(), "1000");
          assert.equal(owner.toString(), deployer.toString());
          assert.equal(startingBalance.toString(), "1000");
        });
      });

      describe("Constants", function () {
        it("UT2: Check the token name", async function () {
          const tokenName = await manualToken.name();
          assert.equal(tokenName, "ManualToken");
        });

        it("UT3: Check the symbol", async function () {
          const tokenSymbol = await manualToken.symbol();
          assert.equal(tokenSymbol, "MT");
        });

        it("UT4: Check the decimals", async function () {
          const tokenDecimals = await manualToken.decimals();
          assert.equal(tokenDecimals.toString(), "8");
        });
      });

      describe("transfer", function () {
        it("UT5: Successful transfer from deployer to receiver1", async function () {
          const deployerStartingBalance = await manualToken.balanceOf(deployer);
          await expect(manualToken.transfer(receiver1, 20)).to.emit(
            manualToken,
            "Transfer"
          );
          const receiver1Balance = await manualToken.balanceOf(receiver1);
          const deployerBalance = await manualToken.balanceOf(deployer);

          assert.equal(parseInt(receiver1Balance._hex), 20);
          assert.equal(
            parseInt(deployerBalance._hex),
            parseInt(deployerStartingBalance._hex) - 20
          );
        });

        it("UT6: Failed transfer 5000 to receiver1", async function () {
          await expect(
            manualToken.transfer(receiver1, 5000)
          ).to.be.revertedWith("ManualToken__NotEnoughTokens");
        });
      });

      describe("transferFrom", function () {
        beforeEach(async function () {
          //receiver1 approves receiver2 to spend 500 max on behalf of receiver1
          await expect(manualTokenReceiver1.approve(receiver2, 500)).to.emit(
            manualTokenReceiver1,
            "Approval"
          );
          //deployer transfers 200 to receiver1
          await expect(manualToken.transfer(receiver1, 200)).to.emit(
            manualToken,
            "Transfer"
          );
        });

        it("UT7: Ensure receiver1 balance == 200", async function () {
          const receiver11Balance = await manualToken.balanceOf(receiver1);
          assert.equal(parseInt(receiver11Balance._hex), 200);
        });

        it("UT8: Ensure receiver2 allowance == 500", async function () {
          const receiver2Allowance = await manualToken.allowance(
            receiver1,
            receiver2
          );

          assert.equal(parseInt(receiver2Allowance._hex), 500);
        });

        it("UT9: transferFrom receiver1 to receiver2 exceeds the approved limit", async function () {
          await expect(
            manualTokenReceiver2.transferFrom(receiver1, receiver2, 600)
          ).to.be.reverted;
        });

        it("UT10: transfeFrom receiver1 to receiver2 is greater than the amount in receiver1's account", async function () {
          await expect(
            manualTokenReceiver2.transferFrom(receiver1, receiver2, 300)
          ).to.be.revertedWith("ManualToken__NotEnoughTokens");
        });

        it("UT11: transfeFrom receiver1 to receiver2 successful", async function () {
          await expect(
            manualTokenReceiver2.transferFrom(receiver1, receiver2, 100)
          ).to.emit(manualToken, "Transfer");
        });
      });
    });
