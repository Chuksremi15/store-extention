import { expect } from "chai";
import { ethers } from "hardhat";
import { PopUpStore, USDT } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("PopUpStore", function () {
  // We define a fixture to reuse the same setup in every test.

  let popUpStore: PopUpStore;
  let usdt: USDT;
  let owner: HardhatEthersSigner;
  //let user2: HardhatEthersSigner;

  before(async () => {
    [owner] = await ethers.getSigners();
    const popUpStoreFactory = await ethers.getContractFactory("PopUpStore");
    const usdtFactory = await ethers.getContractFactory("USDT");

    const usdtContract = (await usdtFactory.deploy()) as USDT;
    usdt = await usdtContract.waitForDeployment();

    popUpStore = (await popUpStoreFactory.deploy(
      owner.address,
      "0x694AA1769357215DE4FAC081bf1f309aDC325306",
      "USDT",
      usdt.target,
    )) as PopUpStore;
    popUpStore = await popUpStore.waitForDeployment();
  });

  describe("Deployment", async function () {
    it("should assign owner on deploy", async function () {
      expect(await popUpStore.owner()).to.equal(owner);
    });
  });

  describe("Payment", async function () {
    it("Should allow adding token", async function () {
      await popUpStore.addPaymentToken("USDT", usdt.target);

      const tokensArray = await popUpStore.getPaymentTokens();

      expect(tokensArray).to.deep.include(["USDT", usdt.target]);
    });

    it("Should allow payment with token", async function () {
      await usdt.connect(owner).approve(popUpStore.target, ethers.parseEther("400"));
      await popUpStore.payWithToken(ethers.parseEther("400"), 0n, "123456789bb");
      expect(await popUpStore.getTokenBalance(0n)).to.equal(ethers.parseEther("400"));
    });

    it("Should allow removing token for payment", async function () {
      await popUpStore.removePaymentToken(0n);

      const tokensArray = await popUpStore.getPaymentTokens();

      console.log("tokensArrays: ", tokensArray);
      expect(tokensArray).to.not.deep.include(["USDT", usdt.target]);
    });

    //expect(tx1, "ethToToken should revert before initalization").not.to.be.reverted;
  });
});
