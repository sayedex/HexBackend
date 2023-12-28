import IORedis from "ioredis";
import { ChainId } from "../config";
import { Queue, Worker } from "bullmq";
const connection = new IORedis();
const ThshareQueue = new Queue("UpdateTshare");
const HexpriceQueue = new Queue("HexpriceQueue");
const HexDaydata = new Queue("HexDaydata");
const updateALLStakers = new Queue("updateALLStakers");
const updateFeeddata = new Queue("updateFeeddata");

//helper func
import {updateGlobalData} from "../utils/Updater/updateGlobalData";
import {fetchAndupdateHexprice} from "../utils/Updater/Priceupdater";
import {fetchAndupdatedDaydata} from "../utils/Updater/Daydataupdater";
import {updateStakersdata} from "../utils/Updater/Stakersdata";
import {fetchAndupdateFeedData} from "../utils/Updater/feedUpdater"


import globalschema from "../Models/GlobalInfo";

export const myWorker = new Worker(
  "UpdateTshare",
  async (job) => {
    try {
      ChainId.map(async(e)=>{
      await updateGlobalData(e)
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
     await fetchAndupdateHexprice(e)
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
  
      ChainId.map(async(e)=>{
      await fetchAndupdatedDaydata(e)
      })
    } catch (erros) {
      console.log("error in myWorker", erros);
    }
  },
  { connection }
);

export const updateALLStakersWorker: any = new Worker(
  "updateALLStakers",
  async (job) => {
    try {
  
      ChainId.map(async(e)=>{
       await updateStakersdata(e)
      })
    } catch (erros) {
      console.log("error in myWorker", erros);
    }
  },
  { connection }
);

export const updateFeeddataworker: any = new Worker(
  "updateFeeddata",
  async (job) => {
    try {
  
      ChainId.map(async(e)=>{
       await fetchAndupdateFeedData(e)
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
        pattern: "0 */6 * * *"
      
      },
    
    }
  );

  await ThshareQueue.add(
    "UpdateTshare",
    { color: "bird" },
    {
      repeat: {
        pattern: "0 */6 * * *"
      },
    }
  );

  await HexpriceQueue.add(
    "HexpriceQueue",
    { color: "bird" },
    {
      repeat: {
        pattern: "*/30 * * * *",
      },
    }
  );
  await updateALLStakers.add(
    "updateALLStakers",
    { color: "bird" },
    {
      repeat: {
        pattern: "*/30 * * * *",
      },
    }
  );
  await updateFeeddata.add(
    "updateFeeddata",
    { color: "bird" },
    {
      repeat: {
        pattern: "*/15 * * * *",
      },
    }
  );

};
