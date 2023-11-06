import axios from "axios";
import utils from "../utils.js";
import Safe from "@safe-global/protocol-kit";
import { EthersAdapter } from "@safe-global/protocol-kit";
import * as ethers from "ethers";
import { OperationType } from "@safe-global/safe-core-sdk-types";

// For more advanced cases, you can use a safe wallet to bundle multiple route queries in a single transaction

// Coming soon is the ability to use the output amount of one hop as the input for the next hop in the bundle.
// If this is something you need for your use case, please bump the priority by contacting https://t.me/connor_enso
const bundleRoutesUsingSafe = async () => {
  // this is the (safe wallet) address we want to run the transaction from
  const fromAddress = "0x2EaC920c002c9f83f278a75b56137CFc091a1F08";
  // this is the chain id we want to make the transaction on
  const chainId = 1;
  // this is the slippage we will set for all routes (can be set individually)
  const slippage = 300;

  const usdt = "0xdac17f958d2ee523a2206206994597c13d831ec7";
  const usdtAmount = ethers.utils.parseUnits("1", 6).toString();
  const eth = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
  const ethAmount = ethers.utils.parseEther("0.01").toString();

  const ausdt = "0x3ed3b47dd13ec9a98b44e6204a523e766b225811";

  // here we get the signer for the safe wallet owner
  const safeOwner = "0x93621DCA56fE26Cdee86e4F6B18E116e9758Ff11";
  const signer = await utils.setup(chainId, safeOwner);

  // note the args for each route bundle are the same as for the route endpoint
  const response = await axios.post(
    `https://api.enso.finance/api/v1/shortcuts/bundle?chainId=${chainId}&fromAddress=${fromAddress}`,
    [
      {
        protocol: "enso",
        action: "route",
        args: {
          slippage,
          tokenIn: eth,
          tokenOut: ausdt,
          amountIn: ethAmount,
        },
      },
      {
        protocol: "enso",
        action: "route",
        args: {
          slippage,
          tokenIn: usdt,
          tokenOut: ausdt,
          amountIn: usdtAmount,
          // for this example we will approve the required tokens prior to
          // executing the bundle of routes
          spender: safeOwner,
        },
      },
    ],
    {
      headers: {
        Authorization: "Bearer 1e02632d-6feb-4a75-a157-documentation",
      },
    }
  );

  const ausdtBefore = await utils.getTokenBalance(ausdt, fromAddress);

  await utils.approveToken(usdt, fromAddress, usdtAmount);

  const safeSdk = await Safe.default.create({
    ethAdapter: new EthersAdapter({ ethers, signerOrProvider: signer }),
    safeAddress: fromAddress,
  });
  const safeTransaction = await safeSdk.createTransaction({
    safeTransactionData: {
      ...response.data.tx,
      operation: OperationType.DelegateCall, // required for security
    },
  });
  await (
    await safeSdk.executeTransaction(safeTransaction)
  ).transactionResponse.wait();

  const ausdtAfter = await utils.getTokenBalance(ausdt, fromAddress);

  console.log(
    `aUSDT balance for ${fromAddress} increased by ${ausdtAfter - ausdtBefore}`
  );
};

bundleRoutesUsingSafe()
  .catch((e) => console.error("🚨", e))
  .finally(() => utils.teardown());
