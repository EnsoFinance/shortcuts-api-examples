import * as ethers from "ethers";

const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
let snapshotId, signer;

export default {
  setup: async (chainId, impersonateAddress) => {
    const { chainId: forkedChainId } = await provider.getNetwork();
    if (parseInt(forkedChainId) !== parseInt(chainId))
      throw `Forked wrong network! Expected ${chainId} got ${forkedChainId}`;

    signer = provider.getSigner(impersonateAddress);
    snapshotId = await provider.send("evm_snapshot", []);

    if (impersonateAddress) {
      await provider.send("anvil_impersonateAccount", [impersonateAddress]);
      await provider.send("anvil_setBalance", [
        impersonateAddress,
        ethers.constants.MaxUint256.toHexString(),
      ]);
    }

    return signer;
  },
  teardown: async () => {
    try {
      await provider.send("evm_revert", [snapshotId]);
    } finally {
      return;
    }
  },
  getTokenBalance: async (tokenAddress, addressToGetBalance) => {
    const erc20 = new ethers.Contract(
      tokenAddress,
      ["function balanceOf(address) view returns (uint256)"],
      provider
    );
    return erc20.balanceOf(addressToGetBalance);
  },
  transferToken: async (tokenAddress, receiverAddress, amount) => {
    const erc20 = new ethers.Contract(
      tokenAddress,
      ["function transfer(address,uint256)"],
      signer
    );
    return (await erc20.transfer(receiverAddress, amount)).wait();
  },
  approveToken: async (tokenAddress, receiverAddress, amount) => {
    const erc20 = new ethers.Contract(
      tokenAddress,
      ["function approve(address,uint256)"],
      signer
    );
    return (await erc20.approve(receiverAddress, amount)).wait();
  },
};
