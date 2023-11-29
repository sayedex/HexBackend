import { ethers } from "ethers";
import { wallet } from "./web3provider";
import crypto from "crypto";
import { Contract } from "@ethersproject/contracts";
import { MinterABI } from "../ABI/minter";
import { Erc721 } from "../ABI/erc721";
import { erc20ABI } from "../ABI/erc20";
import { jNumbers as JNumber } from "../ABI/JNumber";
import { SiweMessage } from "siwe";

export const tokenaddresss = "0x5e6602B762F76d8BFDC7321AA0B787B1E67b187F";
const expectedSigner = "EXPECTED_SIGNER_ADDRESS";
const jNumbersaddress = "0x6f1113B4e32b9107199e8Eae5167B2374207928C";

const RPC_URL = "https://polygon-mumbai.g.alchemy.com/v2/n3y4EA6OMY5NK00nnfRIUn9BC1cBK8Qx";
export const web3client = new ethers.providers.JsonRpcProvider(RPC_URL);


export const polygonClint = new ethers.providers.JsonRpcProvider(
  "https://polygon-bor.publicnode.com"
);
// const provider = new ethers.providers.WebSocketProvider(
//   process.env.ALCHEMY_WEBSOCKET!
// );

export const getProductBaseType = async (productId: number) => {
  const contract = new ethers.Contract(jNumbersaddress, JNumber, web3client);
  try {
    const check = await contract.make_number(productId, false, 0);
    return check.toString();
  } catch {
    return 0;
  }
};

// checks

export function getContract(contractAddress: string, provider: any) {
  try{
    const contract = new ethers.Contract(contractAddress, erc20ABI, provider);
    return contract;
  }catch(e){
    console.log("error in getContract",e);
    return ;
  }
 
}

export async function createSignature(
  account: string,
  id: number,
  amount: number,
  nonce: number
) {
  const data = "0x"; // Replace with any additional data

  const actionMsg = ethers.utils.solidityPack(
    ["address", "string", "string"],
    [account, id.toString(), amount.toString()]
  );

  const message = ethers.utils.solidityPack(
    ["address", "bytes", "string"],
    [wallet.address, actionMsg, nonce.toString()]
  );

  const messageHash = ethers.utils.solidityKeccak256(["bytes"], [message]);

  const signature = await wallet.signMessage(
    ethers.utils.arrayify(messageHash)
  );

  return signature;
}

export async function createSignatureForRegen(
  account: string,
  prepaidRequestTime: number,
  tokenId: number,
  nonce: number
) {
  const data = "0x"; // Replace with any additional data

  const actionMsg = ethers.utils.solidityPack(
    ["address", "uint256", "uint256"],
    [account, prepaidRequestTime, tokenId]
  );

  const message = ethers.utils.solidityPack(
    ["address", "bytes", "string"],
    [wallet.address, actionMsg, nonce.toString()]
  );

  const messageHash = ethers.utils.solidityKeccak256(["bytes"], [message]);

  const signature = await wallet.signMessage(
    ethers.utils.arrayify(messageHash)
  );

  return signature;
}

//genarate nonce
export function generateNonce(input: string) {
  const hash = crypto.createHash("sha256").update(input).digest("hex");
  const numericHash = parseInt(hash, 16);
  const nonce = numericHash % 10000000; // Limit nonce to the range of 0 to 9999999
  return nonce;
}

//hook for Read/write all kind of function for main core contract
const getContractInstance = (signer: any) => {
  var contract = new Contract(process.env.MARKET_CONTRACT!, MinterABI, signer);
  return contract;
};
const getContractInstanceForNFT = (signer: any) => {
  var contract = new Contract(process.env.nftaddress!, Erc721, signer);
  return contract;
};

//return nft contract instance
export const getNftContractinstance = () => {
  var contract = new Contract(
    "0x0b60eab12b8d2b4bf3be0eaa11c5ede360d4527a",
    Erc721,
    polygonClint
  );
  return contract;
};

//Hex to Int convertgetNftContractinstancegetNftContractinstance
export const hexToInt = (s: any) => {
  const bn = ethers.BigNumber.from(s);
  return parseInt(bn.toString());
};

// check signature
export const verifySignature = async (
  wallet: string,
  signature: string,
  nonce: string
) => {
  try {
    // Convert the signature to a format that ethers.js can verify
    const signatureBytes = ethers.utils.arrayify(signature);

    const signer = ethers.utils.verifyMessage(nonce, signatureBytes);

    // Compare the signer address with the provided wallet address
    const isSignatureValid = signer.toLowerCase() === wallet.toLowerCase();

    return isSignatureValid;
  } catch (error) {
    console.error("Error verifying signature:", error);
    return false;
  }
};

// send transation helper
export const Mint = async (fname: string, args: Array<any>) => {
  const name = String(fname);

  const myContract = await getContractInstance(wallet);
  const nftcontract = await getContractInstanceForNFT(wallet);
  try {
    const gasprice = await myContract.estimateGas?.mint(...args);
    const response = await myContract?.[name](...args, {
      gasPrice: 630563940208,
    });
    const receipt = await response.wait();
    const transferSingleLogs = receipt.logs[0];

    const decodedLog = nftcontract.interface.decodeEventLog(
      "TransferSingle",
      transferSingleLogs.data,
      transferSingleLogs.topics
    );

    const id= decodedLog[3];
    const tokenid = id.toString();
    return { tx: receipt.transactionHash, isDone: true, Tokenid: tokenid };
  } catch (e) {
    console.log(e);

    return { tx: null, isDone: false, Tokenid: null };
  }
};

//   let abi = [ "event TransferSingle(address operator, address from, address to,uint256 id,uint256 value)"];
// send transation helper
export const regenProperties = async (fname: string, args: Array<any>) => {
  const name = String(fname);
  const myContract = await getContractInstanceForNFT(wallet);
  try {
    const response = await myContract?.[name](...args, {
      gasPrice: 250000000000,
    });
    const receipt = await response.wait();
    return { tx: receipt.transactionHash, isDone: true };
  } catch (e) {
    console.log(e);
    return { tx: null, isDone: false, Tokenid: null };
  }
};

// convert user deposit amount to actual token amnount
export function bigNumberToNumber(
  bigNumberValue: ethers.BigNumber,
  decimals: number
): number {
  const numberValue: string = ethers.utils.formatUnits(
    bigNumberValue,
    decimals
  );
  return Number(numberValue);
}
