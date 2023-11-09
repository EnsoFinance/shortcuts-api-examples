import axios from "axios";
import utils from "../../utils.js";
import * as ethers from "ethers";

// For more advanced cases, you can bundle multiple route queries in a single transaction

// Coming soon is the ability to use the output amount of one hop as the input for the next hop in the bundle.
// If this is something you need for your use case, please bump the priority by contacting https://t.me/connor_enso
const bundleRoutes = async () => {
  // this is the address we want to run the transaction from
  const fromAddress = "0xd8da6bf26964af9d7eed9e03e53415d37aa96045";
  // this is the chain id we want to make the transaction on
  const chainId = 1;
  // this is the slippage we will set for all routes (can be set individually)
  const slippage = 300;

  const {
    data: { address: walletAddress },
  } = await axios.get(
    `https://api.enso.finance/api/v1/wallet?chainId=${chainId}&fromAddress=${fromAddress}`
  );

  const bal = "0xba100000625a3754423978a60c9317c58a424e3D";
  const balAmount = ethers.utils.parseEther("0.9").toString();
  const weth = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
  const wethAmount = ethers.utils.parseEther("10").toString();
  const usdc = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
  const usdcAmount = ethers.utils.parseUnits("10", 6).toString();

  const b80bal20weth = "0x5c6Ee304399DBdB9C8Ef030aB642B10820DB8F56";
  const stecrv = "0x06325440D014e39736583c165C2963BA99fAf14E";
  const susdc = "0xdf0770dF86a8034b3EFEf0A1Bb3c889B8332FF56";

  const signer = await utils.setup(chainId, fromAddress);
  // note the args for each route bundle are the same as for the route endpoint
  const response = await axios.post(
    `https://api.enso.finance/api/v1/shortcuts/bundle?chainId=${chainId}&fromAddress=${fromAddress}`,
    [
      {
        protocol: "enso",
        action: "route",
        args: {
          slippage,
          tokenIn: [bal, weth],
          tokenOut: b80bal20weth,
          amountIn: [balAmount, wethAmount],
          // for this example we will approve the required tokens prior to
          // executing the bundle of routes
          spender: fromAddress,
        },
      },
      {
        protocol: "enso",
        action: "route",
        args: {
          slippage,
          tokenIn: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
          tokenOut: stecrv,
          amountIn: ethers.utils.parseEther("1.5").toString(),
        },
      },
      {
        protocol: "enso",
        action: "route",
        args: {
          slippage,
          tokenIn: usdc,
          tokenOut: susdc,
          // for this example we will top up the wallet by transferring required
          // erc20 to wallet to save gas compared to approving & transferring
          amountIn: usdcAmount,
        },
      },
    ],
    {
      headers: {
        Authorization: "Bearer 1e02632d-6feb-4a75-a157-documentation",
      },
    }
  );

  const b80bal20wethBefore = await utils.getTokenBalance(
    b80bal20weth,
    walletAddress
  );
  const stecrvBefore = await utils.getTokenBalance(stecrv, walletAddress);
  const susdcBefore = await utils.getTokenBalance(susdc, walletAddress);

  // approving required tokens
  await utils.approveToken(bal, walletAddress, balAmount);
  await utils.approveToken(weth, walletAddress, wethAmount);
  // transferring (topping up) required tokens
  await utils.transferToken(usdc, walletAddress, usdcAmount);

  await signer.sendTransaction(response.data.tx);

  const b80bal20wethAfter = await utils.getTokenBalance(
    b80bal20weth,
    walletAddress
  );
  const stecrvAfter = await utils.getTokenBalance(stecrv, walletAddress);
  const susdcAfter = await utils.getTokenBalance(susdc, walletAddress);

  console.log(
    `B-80BAL-20WETH balance for wallet ${walletAddress} of user ${fromAddress} increased by ${
      b80bal20wethAfter - b80bal20wethBefore
    }`
  );
  console.log(
    `steCRV balance for wallet ${walletAddress} of user ${fromAddress} increased by ${
      stecrvAfter - stecrvBefore
    }`
  );
  console.log(
    `S*USDC balance for wallet ${walletAddress} of user ${fromAddress} increased by ${
      susdcAfter - susdcBefore
    }`
  );
};

bundleRoutes()
  .catch((e) => console.error("🚨", e))
  .finally(() => utils.teardown());
