import axios from "axios";
import utils from "../../utils.js";

// in this example, we will approve multiple erc20 to the wallet and execute a multi sided deposit route where we spend those erc20 tokens

// our routing endpoint currently only supports multi token in when depositing into *most*
// protocols. If a protocol is missing, please don't hesitate to contact us: https://t.me/connor_enso
const approveBalWethTo80BAL20WETH = async () => {
  // this is the address we want to run the transaction from
  const fromAddress = "0xd8da6bf26964af9d7eed9e03e53415d37aa96045";
  // these are the token we will be spending
  const tokensIn = [
    "0xba100000625a3754423978a60c9317c58a424e3D",
    "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  ];
  // this is the amounts we want to spend
  const amountsIn = ["100000000000000000", "1000000000000000000"];
  // this is the address we will transferFrom the erc20
  // note: the spender must hold & approve the required amounts for the smart wallet
  const spender = fromAddress;
  // this is the token we want to receive
  const tokenOut = "0x5c6Ee304399DBdB9C8Ef030aB642B10820DB8F56";
  // this is the chain id we want to make the transaction on
  const chainId = 1;
  // we can set the receiver so it will be transferred out of the smart wallet
  const receiver = fromAddress;

  const {
    data: { address: walletAddress },
  } = await axios.get(
    `https://api.enso.finance/api/v1/wallet?chainId=${chainId}&fromAddress=${fromAddress}`
  );

  const signer = await utils.setup(chainId, fromAddress);
  const response = await axios.get(
    `https://api.enso.finance/api/v1/shortcuts/route?chainId=${chainId}&fromAddress=${fromAddress}&slippage=300&tokenIn=${tokensIn.join()}&tokenOut=${tokenOut}&amountIn=${amountsIn.join()}&spender=${spender}&receiver=${receiver}`,
    {
      headers: {
        Authorization: "Bearer 1e02632d-6feb-4a75-a157-documentation",
      },
    }
  );

  const balanceBefore = await utils.getTokenBalance(tokenOut, fromAddress);
  await utils.approveToken(tokensIn[0], walletAddress, amountsIn[0]);
  await utils.approveToken(tokensIn[1], walletAddress, amountsIn[1]);
  await signer.sendTransaction(response.data.tx);
  const balanceAfter = await utils.getTokenBalance(tokenOut, fromAddress);

  console.log(
    `B-80BAL-20WETH balance for ${fromAddress} increased by ${
      balanceAfter - balanceBefore
    }`
  );
};

approveBalWethTo80BAL20WETH()
  .catch((e) => console.error("🚨", e))
  .finally(() => utils.teardown());
