import IORedis from "ioredis";
import { ChainId } from "../config";
import { Queue, Worker } from "bullmq";
const connection = new IORedis();
const ThshareQueue = new Queue("UpdateTshare");
const HexpriceQueue = new Queue("HexpriceQueue");
const HexDaydata = new Queue("HexDaydata");


//helper func
import {updateGlobalData} from "../utils/Updater/updateGlobalData";
import {fetchAndupdateHexprice} from "../utils/Updater/Priceupdater";
import {fetchAndupdatedDaydata} from "../utils/Updater/Daydataupdater";
import {updateStakersdata} from "../utils/Updater/Stakersdata"
import globalschema from "../Models/GlobalInfo";

export const myWorker = new Worker(
  "UpdateTshare",
  async (job) => {
    try {
      ChainId.map(async(e)=>{
      //  await updateGlobalData(e)
      })
    } catch (erros) {
      console.log("error in myWorker", erros);
    }
  },
  { connection }
);

export const PriceWorker = new Worker(
  "HexpriceQueue",
  async (job) => {
    try {
      ChainId.map(async(e)=>{
     // await fetchAndupdateHexprice(e)
      })
    } catch (erros) {
      console.log("error in myWorker", erros);
    }
  },
  { connection }
);

export const HexDaydataworker: any = new Worker(
  "HexDaydata",
  async (job) => {
    try {
      console.log("annoncement");
      
      ChainId.map(async(e)=>{
       // await fetchAndupdatedDaydata(e)
      })
    } catch (erros) {
      console.log("error in myWorker", erros);
    }
  },
  { connection }
);





//query client 
// pattern: '*/1 * * * *',
// limit:1
//0 */10 * * *

export const UpdateTsharechart = async () => {
  await HexDaydata.add(
    "HexDaydata",
    { color: "bird" },
    {
      repeat: {
        every: 1000,
        limit:1
      
      },
    
    }
  );

  await ThshareQueue.add(
    "UpdateTshare",
    { color: "bird" },
    {
      repeat: {
        every: 1000,
        limit: 1,
      },
    }
  );

  await HexpriceQueue.add(
    "HexpriceQueue",
    { color: "bird" },
    {
      repeat: {
        every: 1000,
        limit: 1,
      },
    }
  );
};
