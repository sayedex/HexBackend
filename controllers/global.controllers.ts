import createError from "../utils/createErrors";
import catchAsyncErrors from "../middileware/catchAsyncErrors";
import { Request, Response, NextFunction, json } from "express";
import { fetchGlobalData } from "../helper/globaldata";
import { fetchTokenData, fetchHexMarketChart } from "../helper/hexprice";
import { fetchShareRateData } from "../helper/shareRate";
import globalschema from "../Models/GlobalInfo";
import Stakersinfo from "../Models/Stakersinfo";
import { DataResults } from "../helper/daydata";
import {fetchStakeAmount} from "../helper/payout"
import IORedis from "ioredis";
const RedisClient = new IORedis();

//test
import { fetchALLStakedata } from "../helper/allstakedata";
import { updateStakersdata } from "../utils/Updater/Stakersdata";
import { DataResults as Globaldata } from "../helper/globaldata";
export const getTest = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    //  const GlobalData: any = await fetchTokenData("0x2b591e99afe9f32eaa6214f7b7629768c40eeb39",
    //    "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3"
    //   );

    // const data = await updateStakersdata(109);

     const newGlobaldata = new globalschema({
         name: "eth",
         id: 1, // Example ID
         LastupdateidETH: 0, // Initial value for Lastsyncupdated
         globaldata: [], // Empty array for Stakers
         pricedata: [], // Initial value for un
         daydata:[]

     });

    newGlobaldata.save()

    const newGlobaldata1 = new globalschema({
      name: "pls",
      id: 109, // Example ID
      LastupdateidETH: 0, // Initial value for Lastsyncupdated
      globaldata: [], // Empty array for Stakers
      pricedata: [], // Initial value for un
      daydata:[]

  });

  newGlobaldata1.save()

    // const initialData = {
    //   name: "pluseX",
    //   id: 109, // Example ID
    //   Lastsyncupdated: 0, // Initial value for Lastsyncupdated
    //   Stakers: [], // Empty array for Stakers
    //   uniqueStakerAddresses: 0, // Initial value for uniqueStakerAddresses
    // };

    // // Upsert (update or insert) the Stakersinfo document
    // await Stakersinfo.updateOne({ id: 109 }, initialData, { upsert: true });

    // const GlobalData = await fetchGlobalData("https://graph.pulsechain.com/subgraphs/name/Codeakk/Hex",0)

    // const data = await fetchHexMarketChart();
    // const globaldata = GlobalData.data;

    // const Tshare = data.map((e: any) => {
    //   const [timestamp, value] = e;
    //   const i = timestamp / 1000 / 86400 - 18233;
    //   const tshareprice =
    //     (Number(value) * Number(globaldata[i]?.shareRate)) / 10;
    //   return { date: timestamp, hexday: Math.round(i), tshare: tshareprice };
    // });
    // const GlobalData: any = await fetchGlobalData(
    //   process.env.Eglobalgraph || "",
    //   1
    // );

    // const Tshare = data.map((e: any) => {
    //   const [timestamp, value] = e;
    //   const i = Math.ceil(timestamp / 1000 / 86400 - 18233);
    //   const tshareprice =
    //     (Number(value) * Number(globaldata[i]?.shareRate)) / 10;
    //   return { date: timestamp, hexday: Math.ceil(i), tshare: tshareprice };
    // });

    res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
    });
  }
);

export const HexpriceChartdata = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const CachedCheck = await RedisClient.get(`Hexprice:${id}`);

    if (CachedCheck) {
      res.status(200).json({
        success: true,
        message: "Data retrieved successfully from Redis",
        data: JSON.parse(CachedCheck),
      });
    } else {
      const data = await globalschema.findOne({ id });

      if (data.pricedata.length > 0) {
        RedisClient.set(
          `Hexprice:${id}`,
          JSON.stringify(data.pricedata),
          "EX",
          10000
        );

        res.status(200).json({
          success: true,
          message: "Price data retrieved successfully from API",
          data: data.pricedata,
        });
      } else {
        res.status(200).json({
          success: true,
          message: "Data retrieved successfully",
          data: [],
        });
      }
    }
  }
);

export const payoutPerTShare = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const CachedCheck = await RedisClient.get(`payoutPerTShare:${id}`);

    if (CachedCheck) {
      res.status(200).json({
        success: true,
        message: "Data retrieved successfully from Redis",
        data: JSON.parse(CachedCheck),
      });
    } else {
      const data = await globalschema.findOne({ id });

      if (data.daydata.length > 0) {
        RedisClient.set(
          `payoutPerTShare:${id}`,
          JSON.stringify(data.daydata),
          "EX",
          10000
        );

        res.status(200).json({
          success: true,
          message: "Price data retrieved successfully from API",
          data: data.daydata,
        });
      } else {
        res.status(200).json({
          success: true,
          message: "Data retrieved successfully",
          data: [],
        });
      }
    }
  }
);

export const TshareUSDprice = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const CachedCheck = await RedisClient.get(`Tsharedata:${id}`);

    if (CachedCheck) {
      res.status(200).json({
        success: true,
        message: "Data retrieved successfully from Redis",
        data: JSON.parse(CachedCheck),
      });
    } else {
      const Tshare = await globalschema.findOne({ id });

      if (Tshare.TshareDataETH.length > 0) {
        RedisClient.set(
          `Tsharedata:${id}`,
          JSON.stringify(Tshare.TshareDataETH),
          "EX",
          60
        );

        res.status(200).json({
          success: true,
          message: "Data retrieved successfully from API",
          data: Tshare.TshareDataETH,
        });
      } else {
        res.status(200).json({
          success: true,
          message: "Data retrieved successfully",
          data: [],
        });
      }
    }
  }
);

export const Totalstekrs = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const CachedCheck = await RedisClient.get(`Totalstekrs:${id}`);

    if (CachedCheck) {
      res.status(200).json({
        success: true,
        message: "Data retrieved successfully from Redis",
        data: { totalstakers: JSON.parse(CachedCheck) },
      });
    } else {
      const data = await Stakersinfo.findOne({ id });

      RedisClient.set(
        `Totalstekrs:${id}`,
        JSON.stringify(data.uniqueStakerAddresses),
        "EX",
        60
      );

      res.status(200).json({
        success: true,
        message: "Data retrieved successfully from API",
        data: { totalstakers: data.uniqueStakerAddresses },
      });
    }
  }
);

export const Daydatahistory = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const CachedCheck = await RedisClient.get(`Daydatahistory:${id}`);

    if (CachedCheck) {
      res.status(200).json({
        success: true,
        message: "Data retrieved successfully from Redis",
        data: { totalstakers: JSON.parse(CachedCheck) },
      });
    } else {
      const data = await globalschema.findOne({ id });
      const daydata = data.daydata;
      // make object to query easily
      let Globaldaydata: Record<number, Globaldata["globalInfos"][0]> = {};
      for (let i = 0; i < data.globaldata.length; i++) {
        let item = data.globaldata[i];
        let hexDay = item.hexDay;

        if (!Globaldaydata.hasOwnProperty(hexDay)) {
          Globaldaydata[hexDay] = item;
        }
      }

     


      RedisClient.set(
        `Daydatahistory:${id}`,
        JSON.stringify(data.uniqueStakerAddresses),
        "EX",
        60
      );

      res.status(200).json({
        success: true,
        message: "Data retrieved successfully from API",
        data: { totalstakers: data.uniqueStakerAddresses },
      });
    }
  }
);
