import axios from "axios";
import utils from "../../utils.js";

const ethToDai = async () => {
  // this is the address we want to run the transaction from
  const fromAddress = "0xd8da6bf26964af9d7eed9e03e53415d37aa96045";
  // this is the token we will be spending
  const tokenIn = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
  // this is the amount we want to spend
  const amountIn = "1000000000000000000";
  // this is the token we want to receive
  const tokenOut = "0x6b175474e89094c44da98b954eedeac495271d0f";
  // this is the chain id we want to make the transaction on
  const chainId = 1;
  // we can set the receiver so it will be transferred out of the smart wallet
  const receiver = fromAddress;

  const signer = await utils.setup(chainId, fromAddress);
  const response = await axios.get(
    `https://api.enso.finance/api/v1/shortcuts/route?chainId=${chainId}&fromAddress=${fromAddress}&tokenIn=${tokenIn}&tokenOut=${tokenOut}&amountIn=${amountIn}&receiver=${receiver}`,
    {
      headers: {
        Authorization: "Bearer 1e02632d-6feb-4a75-a157-documentation",
      },
    }
  );

  const balanceBefore = await utils.getTokenBalance(tokenOut, fromAddress);
  await signer.sendTransaction(response.data.tx);
  const balanceAfter = await utils.getTokenBalance(tokenOut, fromAddress);

  console.log(
    `DAI balance for ${fromAddress} increased by ${
      balanceAfter - balanceBefore
    }`
  );
};

ethToDai()
  .catch((e) => console.error("🚨", e))
  .finally(() => utils.teardown());
