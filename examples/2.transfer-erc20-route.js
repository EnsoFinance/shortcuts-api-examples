import axios from "axios";
import utils from "../utils.js";

// in this example, we will transfer an erc20 to the wallet (top up) and execute a route where we spend that erc20 token

const transferDaiToUsdc = async () => {
  // this is the address we want to run the transaction from
  const fromAddress = "0xd8da6bf26964af9d7eed9e03e53415d37aa96045";
  // this is the token we will be spending
  const tokenIn = "0x6b175474e89094c44da98b954eedeac495271d0f";
  // this is the amount we want to spend
  // we will set tokenInAmountToTransfer in the url since we need to transfer this token from the eoa to the wallet first
  const amountIn = "100000000000000000000";
  // this is the token we want to receive
  const tokenOut = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
  // this is the chain id we want to make the transaction on
  const chainId = 1;
  // this flag is responsible for keeping the funds in ensowallet or transferred to "fromAddress" in the end
  const toEoa = true;

  const walletResponse = await axios.get(
    `https://api.enso.finance/api/v1/wallet?chainId=${chainId}&fromAddress=${fromAddress}`
  );

  const signer = await utils.setup(chainId, fromAddress);
  const response = await axios.get(
    `https://api.enso.finance/api/v1/shortcuts/route?chainId=${chainId}&fromAddress=${fromAddress}&slippage=300&tokenIn=${tokenIn}&tokenOut=${tokenOut}&amountIn=${amountIn}&tokenInAmountToTransfer=${amountIn}&toEoa=${toEoa}`
  );

  const balanceBefore = await utils.getTokenBalance(
    tokenOut,
    await signer.getAddress()
  );
  await utils.transferToken(tokenIn, walletResponse.data.address, amountIn);
  await signer.sendTransaction(response.data.tx);
  const balanceAfter = await utils.getTokenBalance(
    tokenOut,
    await signer.getAddress()
  );

  console.log(
    `USDC balance for ${fromAddress} increased by ${
      balanceAfter - balanceBefore
    }`
  );
};

transferDaiToUsdc()
  .catch((e) => console.error("🚨", e))
  .finally(() => utils.teardown());
