import IORedis from "ioredis";
import { Queue, Worker } from "bullmq";
const connection = new IORedis();
const ThshareQueue = new Queue("UpdateTshare");
const HexpriceQueue = new Queue("HexpriceQueue");
const HexDaydata  = new Queue("HexDaydata");
//helper func
import { fetchAndupdateGlobaldata,fetchAndupdateHexprice,fetchAndupdatedDaydata } from "../utils/Updater";
import globalschema from "../Models/GlobalInfo";

export const myWorker = new Worker(
  "UpdateTshare",
  async (job) => {
    console.log("hii");
    
    try {
      console.log("working");
      const lastSync = await globalschema.findById("655e120ac4c518c7da0cc355");
    
     
      if (lastSync) {
      const lastSyncdocument = await lastSync.LastupdateidETH;

      const { Tshare, lastSyncIDstored } = await fetchAndupdateGlobaldata(
        lastSyncdocument
      );

       if(Tshare.length > 0 && lastSyncIDstored !=0){
        lastSync.LastupdateidETH = lastSync.LastupdateidETH + lastSyncIDstored ; 
        lastSync.TshareDataETH = Tshare; 
        await lastSync.save();

       }

     console.log("done ...")
      }
    } catch (erros) {
      console.log("error in myWorker", erros);
    }
  },
  { connection }
);

export const PriceWorker = new Worker(
  "HexpriceQueue",
  async (job) => {
    console.log("hii from hex");
    
    try {
      console.log("working hex ");

     const pricedata  = await fetchAndupdateHexprice("655e120ac4c518c7da0cc355");

    console.log(pricedata);
      
  

    } catch (erros) {
      console.log("error in myWorker", erros);
    }
  },
  { connection }
);



export const HexDaydataworker:any = new Worker(
  "HexDaydata",
  async (job) => {
    console.log("hii from hex");
    
    try {
      console.log("working hex ");

     const pricedata  = await fetchAndupdatedDaydata("655e120ac4c518c7da0cc355");

    console.log(pricedata);
      
  

    } catch (erros) {
      console.log("error in myWorker", erros);
    }
  },
  { connection }
);



export const UpdateTsharechart = async () => {

  await HexDaydata.add(
    "HexDaydata",
    { color: "bird" },
    {
      repeat: {
        every: 1000,
        limit: 2,
      },
    }
  );


  await ThshareQueue.add(
    "UpdateTshare",
    { color: "bird" },
    {
      repeat: {
        every: 1000,
        limit: 2,
      },
    }
  );

  await HexpriceQueue.add(
    "HexpriceQueue",
    { color: "bird" },
    {
      repeat: {
        every: 1000,
        limit: 2,
      },
    }
  );

};
