import createError from "../utils/createErrors";
import catchAsyncErrors from "../middileware/catchAsyncErrors";
import { Request, Response, NextFunction, json } from "express";
import { fetchGlobalData } from "../helper/globaldata";
import { fetchTokenData, fetchHexMarketChart } from "../helper/hexprice";
import { fetchShareRateData } from "../helper/shareRate";
import globalschema from "../Models/GlobalInfo";
import { DataResults } from "../helper/daydata";
import { fetchStakeAmount } from "../helper/payout";
import { getChainModel } from "../Models/Chain";
import { getFeedModel } from "../Models/Feed";
import IORedis from "ioredis";
const RedisClient = new IORedis();

//test
import { fetchALLStakedata } from "../helper/allstakedata";
import { updateStakersdata } from "../utils/Updater/Stakersdata";
import { DataResults as Globaldata } from "../helper/globaldata";
import { useFetchedFeedDatas } from "../data/Feed/Feeddata";
import { fetchTokenTransactions } from "../data/Feed/Helper/Tradedata";
import { fetchAndupdateFeedData } from "../utils/Updater/feedUpdater";
import { NetBuysell } from "../data/Feed/Netbuysell";
import axios from "axios";

export const getTest = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    //  const GlobalData: any = await fetchTokenData("0x2b591e99afe9f32eaa6214f7b7629768c40eeb39",
    //    "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3"
    //   );

    // const data = await updateStakersdata(109);

    //    const newGlobaldata = new globalschema({
    //        name: "eth",
    //        id: 1, // Example ID
    //        LastupdateidETH: 0, // Initial value for Lastsyncupdated
    //        globaldata: [], // Empty array for Stakers
    //        pricedata: [], // Initial value for un
    //        daydata:[]

    //    });

    //   newGlobaldata.save()

    //      const newGlobaldata1 = new globalschema({
    //       name: "pls",
    //       id: 369, // Example ID
    //       LastupdateidETH: 0, // Initial value for Lastsyncupdated
    //      globaldata: [], // Empty array for Stakers
    //       pricedata: [], // Initial value for un
    //       daydata:[]

    //  });

    //   newGlobaldata1.save()

    //      const initialData = {
    //       name: "pluseX",
    //      id: 109, // Example ID
    //        Lastsyncupdated: 0, // Initial value for Lastsyncupdated
    //       Stakers: [], // Empty array for Stakers
    //      };

    //     //// Upsert (update or insert) the Stakersinfo document
    //    await Stakersinfo.updateOne({ id: 109 }, initialData, { upsert: true });
    //    const initialDataA = {
    //     name: "eth",
    //    id: 1, // Example ID
    //      Lastsyncupdated: 0, // Initial value for Lastsyncupdated
    //     Stakers: [], // Empty array for Stakers
    //    };

    //   //// Upsert (update or insert) the Stakersinfo document
    //  await Stakersinfo.updateOne({ id: 1 }, initialDataA, { upsert: true });

    // const chainModel = getFeedModel(369);

    // // // // Find or create an empty Chain document for the given chain ID
    //  const lastSync = await chainModel.findOneAndUpdate(   { id:
    //   369},
    //   { $setOnInsert: { id: 369,
    //     stakers24h: 0, totalStaked24h: 0 } },
    //    { upsert: true, new: true }
    //  );
    // ;

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

    // const resa  = await useFetchedFeedDatas("",1)

    const data = await NetBuysell(369);

    res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
      data,
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
          21600
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
          21600
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
          21600
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

// const chainModel = getChainModel(idNumber);
// //811109

// const filter = { id: id };
// const update = { $set: { Lastsyncupdated: 701101 } };

// // Assuming newSyncValue is the updated value for Lastsyncupdated
// // If you want to increment the existing value, you can use $inc instead of $set

// //const result = await chainModel.updateOne(filter, update);

// const chainDocument = await chainModel.findOne({ id }, { Lastsyncupdated: 1 });
// console.log(chainDocument);

export const Totalstekrs = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const idNumber: any = Number(id);

    const CachedCheck = await RedisClient.get(`Totalstekrs:${id}`);
    if (CachedCheck) {
      res.status(200).json({
        success: true,
        message: "Data retrieved successfully from Redis",
        data: JSON.parse(CachedCheck),
      });
    } else {
      const chainModel = getChainModel(idNumber);

      const chainDocument = await chainModel.findOne(
        { id },
        { totalstakers: 1, Lastsyncupdated: 1 }
      );
      const stakersCount = chainDocument.totalstakers;
      const stakerCount = chainDocument.Lastsyncupdated;
      const data = {
        totalstakers: stakersCount,
        totalstake: stakerCount,
      };

      RedisClient.set(`Totalstekrs:${id}`, JSON.stringify(data), "EX", 1800);

      res.status(200).json({
        success: true,
        message: "Data retrieved successfully from API",
        data: data,
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

      RedisClient.set(
        `Daydatahistory:${id}`,
        JSON.stringify(data.uniqueStakerAddresses),
        "EX",
        1800
      );

      res.status(200).json({
        success: true,
        message: "Data retrieved successfully from API",
        data: { totalstakers: data.uniqueStakerAddresses },
      });
    }
  }
);

export const Feedhistory = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const idNumber: any = Number(id);

    const CachedCheck = await RedisClient.get(`Feedhistory:${id}`);

    if (CachedCheck) {
      res.status(200).json({
        success: true,
        message: "Data retrieved successfully from Redis",
        data: JSON.parse(CachedCheck),
      });
    } else {
      const FeedModel: any = getFeedModel(idNumber);
      const existingFeed = await FeedModel.findOne({ id: id });

      RedisClient.set(
        `Feedhistory:${id}`,
        JSON.stringify(existingFeed),
        "EX",
        1800
      );

      res.status(200).json({
        success: true,
        message: "Data retrieved successfully from API",
        data: existingFeed,
      });
    }
  }
);

// we will remove it its just for testing
export const PriceHistoryTest = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const COINGECKO_API_URL = "https://api.coingecko.com/api/v3";
    const CachedCheck = await RedisClient.get(`Testprice`);
    if (CachedCheck) {
      res.status(200).json({
        success: true,
        message: "Data retrieved successfully from Redis",
        data: JSON.parse(CachedCheck),
      });
    } else {
      const url = `${COINGECKO_API_URL}/coins/trust-ai/market_chart`;
      const params = {
        vs_currency: "usd",
        days: "max",
      };
      const response = await axios.get(url, { params });
      const existingdata = response.data.prices;
      const price = existingdata.map((e: any) => {
        const [timestamp, price] = e;
        return {
          timestamp: timestamp / 1000,
          price: price,
        };
      });

      RedisClient.set(`Testprice`, JSON.stringify(price), "EX", 1800);

      res.status(200).json({
        success: true,
        message: "Data retrieved successfully from API",
        data: price,
      });
    }
  }
);
