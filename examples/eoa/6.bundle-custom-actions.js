import axios from "axios";
import utils from "../../utils.js";
import * as ethers from "ethers";

// For even more advanced cases, you can bundle multiple *action* queries in a single transaction

// Coming soon is the ability to use the output amount of one hop as the input for the next hop in the bundle.
// If this is something you need for your use case, please bump the priority by contacting https://t.me/connor_enso
const depositAndBorrow = async () => {
  // this is the address we want to run the transaction from
  const fromAddress = "0xd8da6bf26964af9d7eed9e03e53415d37aa96045";
  // this is the chain id we want to make the transaction on
  const chainId = 1;

  // here we are fetching information about the parameters we need to provide
  // to the bundle endpoint later
  const standards = await axios.get(
    `https://api.enso.finance/api/v1/standards`
  );
  const usedStandards = standards.data
    .filter((standard) => ["aave-v2", "erc20"].includes(standard.protocol.slug))
    .map((standard) => ({
      protocol: standard.protocol.slug,
      actions: standard.actions
        .filter((action) =>
          ["transferfrom", "deposit", "borrow"].includes(action.action)
        )
        .map((action) => ({ action: action.action, args: action.inputs })),
    }));
  console.log("\nUsed standards:", JSON.stringify(usedStandards, null, 2));

  const {
    data: { address: walletAddress },
  } = await axios.get(
    `https://api.enso.finance/api/v1/wallet?chainId=${chainId}&fromAddress=${fromAddress}`
  );

  const ausdc = "0x9ba00d6856a4edf4665bca2c2309936572473b7e";
  const aaveV2LendingPool = "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9";
  const usdc = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
  const usdcAmount = ethers.utils.parseUnits("10", 6).toString();

  const dai = "0x6b175474e89094c44da98b954eedeac495271d0f";
  const daiAmount = ethers.utils.parseEther("5").toString();

  const signer = await utils.setup(chainId, fromAddress);
  // note the args for each *action* bundle are the inputs defined at /api/v1/standards or /api/v1/actions endpoint
  const response = await axios.post(
    `https://api.enso.finance/api/v1/shortcuts/bundle?chainId=${chainId}&fromAddress=${fromAddress}`,
    [
      // we are adding "transferfrom" eoa->wallet since we approve the
      // required usdc prior to this bundle tx
      {
        protocol: "erc20",
        action: "transferfrom",
        args: {
          sender: fromAddress,
          recipient: walletAddress,
          token: usdc,
          amount: usdcAmount,
        },
      },
      {
        protocol: "aave-v2",
        action: "deposit",
        args: {
          tokenIn: usdc,
          tokenOut: ausdc,
          amountIn: usdcAmount,
          primaryAddress: aaveV2LendingPool,
        },
      },
      {
        protocol: "aave-v2",
        action: "borrow",
        args: {
          collateral: usdc,
          tokenOut: dai,
          amountOut: daiAmount,
          primaryAddress: aaveV2LendingPool,
        },
      },
    ],
    {
      headers: {
        Authorization: "Bearer 1e02632d-6feb-4a75-a157-documentation",
      },
    }
  );

  const daiBefore = await utils.getTokenBalance(dai, walletAddress);

  // approve required tokens
  await utils.approveToken(usdc, walletAddress, usdcAmount);

  await signer.sendTransaction(response.data.tx);

  const daiAfter = await utils.getTokenBalance(dai, walletAddress);

  console.log(
    `DAI balance for wallet ${walletAddress} of ${fromAddress} increased by ${
      daiAfter - daiBefore
    }`
  );
};

depositAndBorrow()
  .catch((e) => console.error("🚨", e))
  .finally(() => utils.teardown());
