import axios from "axios";
import utils from "../utils.js";

const transferDaiToUsdc = async () => {
  const fromAddress = "0xd8da6bf26964af9d7eed9e03e53415d37aa96045";
  const tokenIn = "0x6b175474e89094c44da98b954eedeac495271d0f";
  const tokenOut = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
  // we will set tokenInAmountToTransfer in the url since we need to transfer this token from the eoa first
  const amountIn = "100000000000000000000";
  const chainId = 1;
  const toEoa = true; // set to false if you want the funds to stay in smart wallet

  const walletResponse = await axios.get(
    `https://shortcuts-backend-dynamic-dev.herokuapp.com/api/v1/wallet?chainId=${chainId}&fromAddress=${fromAddress}`
  );

  const signer = await utils.setup(chainId, fromAddress);
  const response = await axios.get(
    `https://shortcuts-backend-dynamic-dev.herokuapp.com/api/v1/shortcuts/route?chainId=${chainId}&fromAddress=${fromAddress}&slippage=300&tokenIn=${tokenIn}&tokenOut=${tokenOut}&amountIn=${amountIn}&tokenInAmountToTransfer=${amountIn}&toEoa=${toEoa}`
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
