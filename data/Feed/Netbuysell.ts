import { fetchTokenTransactions } from "./Helper/Tradedata";
import { tokenaddress } from "../../config";

interface NetBuySellResult {
  totalBuy: number;
  totalSell: number;
  netBuySell: number;
  buys: number;
  sells: number;
}

export const NetBuysell = async (id: number): Promise<NetBuySellResult> => {
  let totalBuy = 0;
  let totalSell = 0;
  let buys = 0;
  let sells = 0;

  const res = await fetchTokenTransactions(1, tokenaddress[id]);
  const { data } = res;

  if (data && data.length > 0) {
    for (const transaction of data) {
      const {
        amountUSD,
        amountToken0,
        token0Symbol,
        token1Symbol,
        amountToken1,
      } = transaction;

      const outputTokenSymbol = amountToken0 < 0 ? token0Symbol : token1Symbol;
      const inputTokenSymbol = amountToken1 < 0 ? token0Symbol : token1Symbol;

      if (inputTokenSymbol === "HEX") {
        // HEX is in token0, it's a sell
        const positiveAmountUSD = Math.abs(parseFloat(amountToken0));
        totalSell += positiveAmountUSD;
        sells++;
      } else if (outputTokenSymbol === "HEX") {
        const positiveAmountUSD = Math.abs(parseFloat(amountToken1));
        // HEX is in token1, it's a buy
        totalBuy += positiveAmountUSD;
        buys++;
      }
    }
  }

  const netBuySell = totalBuy - totalSell;

  return {
    totalBuy,
    totalSell,
    netBuySell,
    buys,
    sells,
  };
};
