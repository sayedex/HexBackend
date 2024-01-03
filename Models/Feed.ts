import { Schema, model, models, Model } from "mongoose";

enum transation_type {
  STAKE,
  UNSTAKE,
  EARLY,
  SEND,
}

interface Transaction {
  amount: number;
  type: number;
  timestamp: string;
  toAddress?: string;
  fromAddress?: string;
  payout?: string;
  penalty?: string;
  user: string;
  earlyDay?: string;
  stakedDays?: string;
  servedDays?:string
  grpdata?: any[]; // Change to non-optional array
}

interface DataDocument extends Document {
  stakers24h: number;
  totalStaked24h: number;
  transactions: Transaction[] | undefined;
  totalBuy: number;
  totalSell: number;
  netBuySell: number;
  id: number;
}

// Chain schema
const transactionSchema = new Schema<Transaction>({
  amount: { type: Number, required: true },
  type: { type: Number, required: true },
  timestamp: { type: String, required: true },
  toAddress: { type: String },
  fromAddress: { type: String },
  payout: { type: String },
  penalty: { type: String },
  user: { type: String, required: true },
  earlyDay: { type: String },
  stakedDays: { type: String },
  servedDays: { type: String },
  grpdata:{type:Array}
});

const FeedSchema = new Schema<DataDocument>({
  stakers24h: { type: Number, required: true, default: 0 },
  totalStaked24h: { type: Number, required: true, default: 0 },
  transactions: [transactionSchema],
  totalBuy: { type: Number, default: 0 },
  totalSell: { type: Number, default: 0 },
  netBuySell: { type: Number, default: 0 },
  id: { type: Number, required: true },
});

export const getFeedModel = (chainId: number) => {
  const collectionName = `Feed_${chainId}`;
  return models[collectionName] || model(collectionName, FeedSchema);
};

const MetadataSchemaDB = models.FeedSchema || model("Feed", FeedSchema);

export default MetadataSchemaDB;
