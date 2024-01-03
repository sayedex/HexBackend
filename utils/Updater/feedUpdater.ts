import FeedSchema from "../../Models/Feed";
import { getFeedModel } from "../../Models/Feed";
import { NetBuysell } from "../../data/Feed/Netbuysell";
import { useFetchedFeedDatas } from "../../data/Feed/Feeddata";

export const fetchAndupdateFeedData = async (id: number) => {
  const FeedModel = getFeedModel(id);
  const existingFeed = await FeedModel.findOne({ id: id });

  if (existingFeed) {
    const { totalStaked24h, transation, stakers24h } =
      (await useFetchedFeedDatas(id)) || {};

    const { totalBuy, totalSell, netBuySell } = (await NetBuysell(id)) || {};

    // Update existingFeed with the new data
    if (totalStaked24h !== undefined) {
      existingFeed.totalStaked24h = totalStaked24h;
    }

    if (transation !== undefined) {
      existingFeed.transactions = transation;
    }

    if (stakers24h !== undefined) {
      existingFeed.stakers24h = stakers24h;
    }

    if (totalBuy !== undefined) {
      existingFeed.totalBuy = totalBuy;
    }

    if (totalSell !== undefined) {
      existingFeed.totalSell = totalSell;
    }
    if (netBuySell !== undefined) {
      existingFeed.netBuySell = netBuySell;
    }

    console.log("feed data updated");
    
    // Save the updated document
    await existingFeed.save();
  }
};
