import createError from "../utils/createErrors";
import catchAsyncErrors from "../middileware/catchAsyncErrors";
import { Request, Response, NextFunction, json } from "express";
import { fetchGlobalData } from "../helper/globaldata";
import { fetchTokenData, fetchHexMarketChart } from "../helper/hexprice";
import { fetchShareRateData } from "../helper/shareRate";
import globalschema from "../Models/GlobalInfo";
import IORedis from "ioredis";
const RedisClient = new IORedis();

export const getTest = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
   const GlobalData: any = await fetchTokenData("0x2b591e99afe9f32eaa6214f7b7629768c40eeb39",
     "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3"
    );

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
      GlobalData: GlobalData,
    });
  }
);

export const HexpriceChartdata = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.body;
    const CachedCheck = await RedisClient.get("Hexprice");
    if (CachedCheck) {
      res.status(200).json({
        success: true,
        message: "data retrieved successfully redis",
        data: JSON.parse(CachedCheck),
      });
    }else{
      const data = await globalschema.findById("655e120ac4c518c7da0cc355");
      if (data.pricedata.length > 0) {
        RedisClient.set("Hexprice",JSON.stringify(data.pricedata),"EX",10000)
        res.status(200).json({
          success: true,
          message: "price data retrieved successfully api",
          data: data.pricedata,
        });
      } else {
        res.status(200).json({
          success: true,
          message: "data retrieved successfully",
          data: [],
        });
      }

    }
  }
);

export const TshareUSDprice = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.body;

    const CachedCheck = await RedisClient.get("Tsharedata");
    if (CachedCheck) {
      res.status(200).json({
        success: true,
        message: "data retrieved successfully redis",
        data: JSON.parse(CachedCheck),
      });
    } else {
      const Tshare = await globalschema.findById("655e120ac4c518c7da0cc355");
      if (Tshare.TshareDataETH.length > 0) { 
        RedisClient.set("Tsharedata",JSON.stringify(Tshare.TshareDataETH),"EX",60)
        res.status(200).json({
          success: true,
          message: "data retrieved successfully api",
          data: Tshare.TshareDataETH,
        });
      } else {
        res.status(200).json({
          success: true,
          message: "data retrieved successfully",
          data: [],
        });
      }
    }
  }
);
