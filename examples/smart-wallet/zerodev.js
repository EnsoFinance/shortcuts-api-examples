import axios from "axios";
import { Wallet } from "ethers";
import { getZeroDevProvider } from "@zerodevapp/sdk/dist/src/index.js";
import { ExecuteType } from "@zerodevapp/sdk/dist/src/BaseAccountAPI.js";

const gethToUsdcUsingZeroDev = async () => {
  // make sure project & policy is setup on https://app.zerodev.xyz
  const projectId = "562e1920-373a-493d-b897-26468b43a350";

  // 0x45F231f743108c1d917166C296212BE15a686B09
  const owner = new Wallet(
    "0x7df5b22ebe7fb17541966a0f87709cfa49d79a3eb8e6faf0b01fe9348a99e6e2"
  );

  const provider = await getZeroDevProvider({
    projectId,
    owner,
  });
  const signer = provider.getSigner();

  // this is the address we want to run the transaction from
  // make sure the smart wallet has required amountIn and gas
  // you can use a faucet to get some testnet ETH
  const fromAddress = await signer.getAddress(); // 0x23090eFfDFe9e200db897716A2c1680c0477D230
  // this is the address we want to receive the tokenOut
  const receiver = owner.address; // 0x45F231f743108c1d917166C296212BE15a686B09
  // this is the chain id we want to make the transaction on
  const chainId = await signer.getChainId();
  // this is the token we will be spending
  const tokenIn = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
  // this is the amount we want to spend
  const amountIn = "10";
  // this is the token we want to receive
  const tokenOut = "0xd35cceead182dcee0f148ebac9447da2c4d449c4";

  const {
    data: { tx },
  } = await axios.get(
    `http://api.enso.finance/api/v1/shortcuts/route?chainId=${chainId}&fromAddress=${fromAddress}&receiver=${receiver}&tokenIn=${tokenIn}&tokenOut=${tokenOut}&amountIn=${amountIn}`,
    {
      headers: {
        Authorization: "Bearer 1e02632d-6feb-4a75-a157-documentation",
      },
    }
  );

  const { hash } = await signer.sendTransaction(
    tx,
    ExecuteType.EXECUTE_DELEGATE
  );

  console.log(`\n\nhttps://jiffyscan.xyz/userOpHash/${hash}`);
  process.exit();
};

gethToUsdcUsingZeroDev().catch((e) => console.error("🚨", e.stack));
