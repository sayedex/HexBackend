import { ethers } from "ethers";
require("dotenv").config();

export const provider = new ethers.providers.JsonRpcProvider(process.env.rpc);

const walletkey = process.env.walletkey!;
export const wallet = new ethers.Wallet(walletkey, provider);

//new ethers.providers.WebSocketProvide

export function getProviderLink(chainId: number) {
  let providerURL;
  switch (chainId) {
    case 1: // Ethereum Mainnet
      providerURL = process.env.ETH_RPC || "";
      break;
    case 80001: // mumbai
      providerURL = process.env.MUMBAI_RPC || "";
      break;
    case 56: // bsc
      providerURL = process.env.BSC_RPC || "";
      break;
    case 137: // polygon
      providerURL = process.env.POLYGON_RPC || "";
      break;
    case 97: // bsc testnet
      providerURL = process.env.BSCTEST_RPC || "";
      break;
    default:
      // Default to Ethereum Mainnet provider
      providerURL = process.env.POLYGON_RPC || "";
  }

  return providerURL;
}

export function getProviderForChain(chainId: number) {
  const url = getProviderLink(chainId) || "";
  try {
    const provider = new ethers.providers.JsonRpcProvider(url);
    return provider;
  } catch (e) {
    console.log("asasas");
    
    console.log(e, "error in getProviderForChain");

    return false;
  }
}
