import axios from "axios";
import utils from "../utils.js";

// Our routing endpoint currently only supports multi token in when depositing into *most*
// protocols. If a protocol is missing, please don't hesitate to contact us: https://t.me/connor_enso
const approveBalWethTo80BAL20WETH = async () => {
  const fromAddress = "0xd8da6bf26964af9d7eed9e03e53415d37aa96045";
  const tokensIn = [
    "0xba100000625a3754423978a60c9317c58a424e3D",
    "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  ];
  // we will set tokenInAmountToApprove in the url since we need to approve these tokens from the eoa first
  const amountsIn = ["100000000000000000", "1000000000000000000"];
  const tokenOut = "0x5c6Ee304399DBdB9C8Ef030aB642B10820DB8F56";
  const chainId = 1;
  const toEoa = true; // set to false if you want the funds to stay in smart wallet

  const walletResponse = await axios.get(
    `https://api.enso.finance/api/v1/wallet?chainId=${chainId}&fromAddress=${fromAddress}`
  );

  const signer = await utils.setup(chainId, fromAddress);
  const response = await axios.get(
    `https://api.enso.finance/api/v1/shortcuts/route?chainId=${chainId}&fromAddress=${fromAddress}&slippage=300&tokenIn=${tokensIn.join()}&tokenOut=${tokenOut}&amountIn=${amountsIn.join()}&tokenInAmountToApprove=${amountsIn.join()}&toEoa=${toEoa}`
  );

  const balanceBefore = await utils.getTokenBalance(
    tokenOut,
    await signer.getAddress()
  );
  await utils.approveToken(
    tokensIn[0],
    walletResponse.data.address,
    amountsIn[0]
  );
  await utils.approveToken(
    tokensIn[1],
    walletResponse.data.address,
    amountsIn[1]
  );
  await signer.sendTransaction(response.data.tx);
  const balanceAfter = await utils.getTokenBalance(
    tokenOut,
    await signer.getAddress()
  );

  console.log(
    `B-80BAL-20WETH balance for ${fromAddress} increased by ${
      balanceAfter - balanceBefore
    }`
  );
};

approveBalWethTo80BAL20WETH()
  .catch((e) => console.error("🚨", e))
  .finally(() => utils.teardown());
