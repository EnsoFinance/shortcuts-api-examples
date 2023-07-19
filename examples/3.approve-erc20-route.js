import axios from "axios";
import utils from "../utils.js";

// in this example, we will approve an erc20 to the wallet and execute a route where we spend that erc20 token

const approveDaiToAdai = async () => {
  // this is the address we want to run the transaction from
  const fromAddress = "0xd8da6bf26964af9d7eed9e03e53415d37aa96045";
  // this is the token we will be spending
  const tokenIn = "0x6b175474e89094c44da98b954eedeac495271d0f";
  // this is the amount we want to spend
  // we will set tokenInAmountToApprove in the url since we need to approve this token from the eoa to the wallet first
  const amountIn = "100000000000000000000";
  // this is the token we want to receive
  const tokenOut = "0x5d3a536e4d6dbd6114cc1ead35777bab948e3643";
  // this is the chain id we want to make the transaction on
  const chainId = 1;
  // this flag is responsible for keeping the funds in ensowallet or transferred to "fromAddress" in the end
  const toEoa = true;

  const walletResponse = await axios.get(
    `https://api.enso.finance/api/v1/wallet?chainId=${chainId}&fromAddress=${fromAddress}`
  );

  const signer = await utils.setup(chainId, fromAddress);
  const response = await axios.get(
    `https://api.enso.finance/api/v1/shortcuts/route?chainId=${chainId}&fromAddress=${fromAddress}&slippage=300&tokenIn=${tokenIn}&tokenOut=${tokenOut}&amountIn=${amountIn}&tokenInAmountToApprove=${amountIn}&toEoa=${toEoa}`,
    {
      headers: {
        Authorization: "Bearer 1e02632d-6feb-4a75-a157-documentation",
      },
    }
  );

  const balanceBefore = await utils.getTokenBalance(tokenOut, fromAddress);
  await utils.approveToken(tokenIn, walletResponse.data.address, amountIn);
  await signer.sendTransaction(response.data.tx);
  const balanceAfter = await utils.getTokenBalance(tokenOut, fromAddress);

  console.log(
    `cDAI balance for ${fromAddress} increased by ${
      balanceAfter - balanceBefore
    }`
  );
};

approveDaiToAdai()
  .catch((e) => console.error("🚨", e))
  .finally(() => utils.teardown());
