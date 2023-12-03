import { Schema, model, models, Model } from "mongoose";

const Stakers = new Schema({
  stakeId: { type: Number, required: true },
  stakeShares: { type: Number, required: true },
  stakeTShares: { type: Number, required: true },
  stakedDays: { type: Number, required: true },
  stakedHearts: { type: Number, required: true },
  stakerAddr: { type: String, required: true },
  startDay: { type: Number, required: true },
  endDay: { type: Number, required: true },
});

const Stakersinfo: any = new Schema({
  name: {
    type: String,
    required: true,
  },
  id: {
    type: Number,
    required: true,
  },
  Lastsyncupdated: {
    type: Number,
    required: true,
  },
  Stakers: {
    type: [Stakers],
    required: false,
  },
  uniqueStakerAddresses:{
    type:Number,
    required: false,
  }
});

const MetadataSchemaDB =
  models.Stakersinfo || model("Stakersinfo", Stakersinfo);

export default MetadataSchemaDB;
