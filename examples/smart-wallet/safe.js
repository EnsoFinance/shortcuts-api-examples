import axios from "axios";
import utils from "../../utils.js";
import Safe from "@safe-global/protocol-kit";
import { EthersAdapter } from "@safe-global/protocol-kit";
import * as ethers from "ethers";
import { OperationType } from "@safe-global/safe-core-sdk-types";

// in this example, we will execute a route via a safe wallet

const ethToAdaiUsingSafe = async () => {
  // this is the (safe wallet) address we want to run the transaction from
  const fromAddress = "0x2EaC920c002c9f83f278a75b56137CFc091a1F08";
  // this is the token we will be spending
  const tokenIn = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
  // this is the amount we want to spend
  const amountIn = "1000000000000000";
  // this is the token we want to receive
  const tokenOut = "0xfC1E690f61EFd961294b3e1Ce3313fBD8aa4f85d";
  // this is the chain id we want to make the transaction on
  const chainId = 1;

  // here we get the signer for the safe wallet owner
  const safeOwner = "0x93621DCA56fE26Cdee86e4F6B18E116e9758Ff11";
  const signer = await utils.setup(chainId, safeOwner);

  const response = await axios.get(
    `https://api.enso.finance/api/v1/shortcuts/route?chainId=${chainId}&fromAddress=${fromAddress}&slippage=300&tokenIn=${tokenIn}&tokenOut=${tokenOut}&amountIn=${amountIn}`,
    {
      headers: {
        Authorization: "Bearer 1e02632d-6feb-4a75-a157-documentation",
      },
    }
  );

  const balanceBefore = await utils.getTokenBalance(tokenOut, fromAddress);
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
  const balanceAfter = await utils.getTokenBalance(tokenOut, fromAddress);

  console.log(
    `aDAI balance for ${fromAddress} increased by ${
      balanceAfter - balanceBefore
    }`
  );
};

ethToAdaiUsingSafe()
  .catch((e) => console.error("🚨", e))
  .finally(() => utils.teardown());
