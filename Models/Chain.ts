import { Schema, model, models, Model } from "mongoose";

const Stakers = new Schema({
  // stakeId: { type: Number, required: true },
  // stakeShares: { type: Number, required: true },
  // stakeTShares: { type: Number, required: true },
  // stakedDays: { type: Number, required: true },
  // stakedHearts: { type: Number, required: true },
  stakerAddr: { type: String, required: true },
  // startDay: { type: Number, required: true },
  // endDay: { type: Number, required: true },
});

// Chain schema
const Chain = new Schema({
  name: { type: String, required: true },
  id: { type: Number, required: true },
  Lastsyncupdated: { type: Number, required: true },
  stakers: [{ type: Stakers, required: false }],
});

export const getChainModel = (chainId: number) => {
  const collectionName = `Chain_${chainId}`;
  return models[collectionName] || model(collectionName, Chain);
};

const MetadataSchemaDB = models.Stakersinfo || model("Chain", Chain);

export default MetadataSchemaDB;
