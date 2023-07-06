import axios from "axios";
import utils from "../utils.js";

const ethToDai = async () => {
  const fromAddress = "0xd8da6bf26964af9d7eed9e03e53415d37aa96045";
  const tokenIn = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
  const tokenOut = "0x6b175474e89094c44da98b954eedeac495271d0f";
  const amountIn = "1000000000000000000";
  const chainId = 1;
  const toEoa = true; // set to false if you want the funds to stay in smart wallet

  const signer = await utils.setup(chainId, fromAddress);
  const response = await axios.get(
    `https://api.enso.finance/api/v1/shortcuts/route?chainId=${chainId}&fromAddress=${fromAddress}&tokenIn=${tokenIn}&tokenOut=${tokenOut}&amountIn=${amountIn}&toEoa=${toEoa}`
  );

  const balanceBefore = await utils.getTokenBalance(
    tokenOut,
    await signer.getAddress()
  );
  await signer.sendTransaction(response.data.tx);
  const balanceAfter = await utils.getTokenBalance(
    tokenOut,
    await signer.getAddress()
  );

  console.log(
    `DAI balance for ${fromAddress} increased by ${
      balanceAfter - balanceBefore
    }`
  );
};

ethToDai()
  .catch((e) => console.error("🚨", e))
  .finally(() => utils.teardown());
