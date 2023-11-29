import createError from "../utils/createErrors";
import catchAsyncErrors from "../middileware/catchAsyncErrors";
import { Request, Response, NextFunction, json } from "express";
import { fetchGlobalData } from "../helper/globaldata";
import { fetchTokenData, fetchHexMarketChart } from "../helper/hexprice";
import { fetchShareRateData } from "../helper/shareRate";
import globalschema from "../Models/GlobalInfo";
import { fetchStakedata } from "../helper/stakedata";
import { stakeStarts } from "../helper/stakedata";
import { DataResults } from "../helper/daydata";
import {calculateBigPayDayReward} from "../utils/reward"
export const getStakedata = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.body;
    //https://api.thegraph.com/subgraphs/name/codeakk/hex
    const { stakeStarts, stakeEnds } = await fetchStakedata(
      "0x19ea995059c9115df7ab7261e3337af699974249",
      "https://api.thegraph.com/subgraphs/name/codeakk/hex"
    );

    const globaldata = await globalschema.findOne({ id: 1 });

    // get current hex day
    const currentHexday = 1457;

    let Daydata: Record<number, DataResults["dailyDataUpdates"][0]> = {};
    for (let i = 0; i < globaldata.daydata.length; i++) {
      let item = globaldata.daydata[i];
      let hexDay = item.endDay;

      if (!Daydata.hasOwnProperty(hexDay)) {
        Daydata[hexDay] = item;
      }
    }

    //bigPayDayTotal: JSBI.fromString("0xfae0c6a6400dadc0", 16)

    const data = stakeStarts.map((stakeRecord: stakeStarts, indx) => {
      let apy: number = 0;
      let dailyReward: number = 0;
      let Yield: number = 0;
      let daysLive = 0;

      const {
        stakeId,
        stakedHearts,
        startDay,
        endDay,
        stakedDays,
        stakeShares,
        stakeTShares,
      } = stakeRecord;
      // unit to actual value
      // amount staked
      const StakeAmount = stakedHearts / 10 ** 8;

      /// how much days live
      for (
        let day = startDay;
        day < (currentHexday > endDay ? endDay : currentHexday);
        day++
      ) {
        const dayIndex = day - startDay + 1;
        //get day data
        const { payoutPerTShare, payout } = Daydata[day];
        const rewardDaily = payoutPerTShare * stakeTShares;
        // total reward that earned
        Yield += rewardDaily;
        daysLive += 1;

        // if there is big pay day
        if (day == 354) {
          console.log("found Big pay day bro");
          const bigPayDayReward: number = calculateBigPayDayReward(
            stakeShares
          );
          Yield += bigPayDayReward;
        }
      }

      const YesterdayAPY = 0;
      // all apy
      apy = (Yield / StakeAmount) * (356 / daysLive) * 100;

      return {
        apy,
        dailyReward,
        Yield,
        StakeAmount,
        stakeId,
        daysLive,
      };
    });

    res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
      data: data,
    });
  }
);
