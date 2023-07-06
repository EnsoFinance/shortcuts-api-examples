import axios from "axios";
import utils from "../utils.js";

const approveDaiToAdai = async () => {
  const fromAddress = "0xd8da6bf26964af9d7eed9e03e53415d37aa96045";
  const tokenIn = "0x6b175474e89094c44da98b954eedeac495271d0f";
  const tokenOut = "0xfC1E690f61EFd961294b3e1Ce3313fBD8aa4f85d";
  // we will set tokenInAmountToApprove in the url since we need to approve this token from the eoa first
  const amountIn = "100000000000000000000";
  const chainId = 1;
  const toEoa = true; // set to false if you want the funds to stay in smart wallet

  const walletResponse = await axios.get(
    `https://api.enso.finance/api/v1/wallet?chainId=${chainId}&fromAddress=${fromAddress}`
  );

  const signer = await utils.setup(chainId, fromAddress);
  const response = await axios.get(
    `https://api.enso.finance/api/v1/shortcuts/route?chainId=${chainId}&fromAddress=${fromAddress}&slippage=300&tokenIn=${tokenIn}&tokenOut=${tokenOut}&amountIn=${amountIn}&tokenInAmountToApprove=${amountIn}&toEoa=${toEoa}`
  );

  const balanceBefore = await utils.getTokenBalance(
    tokenOut,
    await signer.getAddress()
  );
  await utils.approveToken(tokenIn, walletResponse.data.address, amountIn);
  await signer.sendTransaction(response.data.tx);
  const balanceAfter = await utils.getTokenBalance(
    tokenOut,
    await signer.getAddress()
  );

  console.log(
    `aDAI balance for ${fromAddress} increased by ${
      balanceAfter - balanceBefore
    }`
  );
};

approveDaiToAdai()
  .catch((e) => console.error("🚨", e))
  .finally(() => utils.teardown());
