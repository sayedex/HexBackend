import { Schema, model, models, Model } from "mongoose";

interface TshareData {
  timestamp: number;
  hexday: number;
  tshare: number;
}
interface DataTuple {
  timestamp: Date;
  value: number;
}

interface TshareDataDocument extends TshareData, Document {}

const TshareDataSchema = new Schema<TshareDataDocument>({
  timestamp: { type: Number, required: true },
  hexday: { type: Number, required: true },
  tshare: { type: Number, required: true },
});

// Define the schema for the nested data
const globaldataSchema = new Schema({
  timestamp: { type: Date, required: true },
  shareRate: { type: String, required: true },
  latestStakeId: { type: String, required: true },
  hexDay: { type: Number, required: true },
});

// Define the schema for the nested data
const Hexprice = new Schema({
  timestamp: { type: Number, required: true },
  price: { type: Number, required: true },
});

const Daydata= new Schema({
  timestamp: { type: Number, required: true },
  endDay: { type: Number, required: true },
  payout: { type: Number, required: true },
  payoutPerTShare: { type: Number, required: true },
  shares: { type: Number, required: true },
  beginDay:{ type: Number, required: true }
})



const Globaldata:any = new Schema({
  name: {
    type: String,
    required: true,
  },
  id:{
    type: Number,
    required: true,
  },
  TshareDataETH: [TshareDataSchema],
  LastupdateidETH:{
    type: Number,
    required: true,
  },

  globaldata:{
    type:[globaldataSchema],
    required: false
  },
  pricedata:{
    type:[Hexprice],
    required: false
  } ,
  daydata:{
    type:[Daydata],
    required: false
  }

});



const MetadataSchemaDB =
  models.Globaldata || model("Globaldata", Globaldata);

export default MetadataSchemaDB;
