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
import { DataResults as Globaldata } from "../helper/globaldata";
import { TokendataClient } from "../utils/dataClient";
import {
  calculateBigPayDayReward,
  calculateAPY,
  calculateDailyReward,
  calculateMonthlyReward,
  calculateYearlyReward,
  yesterdaycalculateAPY,
  calculateAverageStakeLength,
} from "../utils/reward";
export const getStakedata = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id, userAddress } = req.params;
    const { stakeStarts, stakeEnds } = await fetchStakedata(
      userAddress,
      TokendataClient[Number(id)]
    );
  
    
    //0xa7633f37FEEfaCAc8F251b914e92Ff03d2acf0f2

    // global state
    const globaldata = await globalschema.findOne({ id: 1 });
    // get current hex day
    const currentHexday = globaldata.daydata.length + 1;

    // make object to query easily
    let Daydata: Record<number, DataResults["dailyDataUpdates"][0]> = {};
    for (let i = 0; i < globaldata.daydata.length; i++) {
      let item = globaldata.daydata[i];
      let hexDay = item.endDay;

      if (!Daydata.hasOwnProperty(hexDay)) {
        Daydata[hexDay] = item;
      }
    }

    // make object to query easily
    let Globaldaydata: Record<number, Globaldata["globalInfos"][0]> = {};
    for (let i = 0; i < globaldata.globaldata.length; i++) {
      let item = globaldata.globaldata[i];
      let hexDay = item.hexDay;

      if (!Daydata.hasOwnProperty(hexDay)) {
        Daydata[hexDay] = item;
      }
    }

    if (stakeStarts.length <= 0) {
      res.status(200).json({
        success: true,
        message: "stake data successfully",
        activestake: [],
        stakeEnds: [],
      });
    }

    const stake = stakeStarts.map((stakeRecord: stakeStarts, indx) => {
      let apy: number = 0;
      let Yield: number = 0;
      let daysLive = 0;
      let dailyReward = 0;
      let monthlyReward = 0;
      let yearlyReward = 0;
      let yesterdayYield = 0;
      let yesterdayApy = 0;
      let potentialPenalty = 0;
      let rewardsPenalty = 0;
      let yieldPenalty = 0;
      let isEnded = false;
      let endedDay = 0;
      let daycount = 0;

      // is big day?
      let HasBigPayDay = false;
      // is matched with end day..
      const correspondingEnd = stakeEnds.find(
        (end) => end.stakeId === stakeRecord.stakeId
      );

      const {
        stakeId,
        stakedHearts,
        startDay,
        endDay,
        stakedDays,
        stakeShares,
        stakeTShares,
      } = stakeRecord;
      // amount staked
      const StakeAmount = stakedHearts / 10 ** 8;
      endedDay = endDay;
   
      // 1468 > 1490 ? 1490

      for (
        let day = Number(startDay);
        day <=
        (currentHexday > Number(endDay) ? Number(endDay) : currentHexday);
        day++
      ) {
    
        
        //get day data
        const { payoutPerTShare, payout } = Daydata[day];

        const rewardDaily = payoutPerTShare * stakeTShares;
        const lastDay = endDay <= currentHexday;
        const yesterday =
          endDay <= currentHexday ? endDay - 1 : currentHexday - 1;

        if (day === yesterday) {
          yesterdayYield += rewardDaily;
        }

        Yield += rewardDaily;
        daycount +=1;

        // if there is big pay day
        if (day == 354) {
          HasBigPayDay = true;
          const bigPayDayReward: number = calculateBigPayDayReward(stakeShares);
          Yield += bigPayDayReward;
        }
      }
      daysLive =
        Number(endDay) <= currentHexday
          ? Number(stakedDays)
          :daycount;

      // end

      if (currentHexday <= Number(endDay)) {
        const penalty = (Yield * Number(stakedDays)) / 2 / daysLive;
        potentialPenalty = StakeAmount - penalty + Yield;
        if (potentialPenalty < 0) {
          potentialPenalty = StakeAmount + Yield;
          rewardsPenalty = Yield;
          const yieldPenaltyCalculate = Yield - penalty;
          if (yieldPenaltyCalculate < 0) {
            yieldPenalty = Yield;
          } else {
            yieldPenalty = yieldPenaltyCalculate;
          }
        }
      }

      // it will update at the end
      if (correspondingEnd) {
        potentialPenalty = correspondingEnd.penalty;
        daysLive = correspondingEnd.servedDays;
        endedDay = Number(startDay) + Number(correspondingEnd.servedDays);
        isEnded = true;
      }

      // all reward calculation is here
      apy = calculateAPY(Yield, StakeAmount, daysLive);
      yesterdayApy = yesterdaycalculateAPY(yesterdayYield, StakeAmount);
      dailyReward = calculateDailyReward(apy, StakeAmount);
      monthlyReward = calculateMonthlyReward(apy, StakeAmount);
      yearlyReward = calculateYearlyReward(apy, StakeAmount);

      return {
        apy,
        yesterdayApy,
        dailyReward,
        yield: Yield,
        yesterdayYield,
        StakeAmount,
        stakeId,
        daysLive,
        dailyRewardHex: dailyReward,
        monthlyRewardhex: monthlyReward,
        yearlyReward,
        shares: stakeTShares,
        endDay: endedDay,
        startDay,
        stakedDays,
        HasBigPayDay,
        potentialPenalty,
        yieldPenalty,
        isEnded,
      };
    });

    // filter active stake
    const ActiveStake = stake.filter((start: any) => start.isEnded == false);

    // filter ended data
    const stakeEnded = stake.filter((start: any) => start.isEnded == true);

    res.status(200).json({
      success: true,
      message: "stake data successfully",
      activestake: ActiveStake,
      stakeEnds: stakeEnded,
    });
  }
);

export const getStakeinfo = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id, userAddress } = req.params;
    const { stakeStarts, stakeEnds } = await fetchStakedata(
      userAddress,
      TokendataClient[Number(id)]
    );

    // global state
    const globaldata = await globalschema.findOne({ id: 1 });
    // get current hex day
    const currentHexday = globaldata.daydata.length + 1;

    // make object to query easily
    let Daydata: Record<number, DataResults["dailyDataUpdates"][0]> = {};
    for (let i = 0; i < globaldata.daydata.length; i++) {
      let item = globaldata.daydata[i];
      let hexDay = item.endDay;

      if (!Daydata.hasOwnProperty(hexDay)) {
        Daydata[hexDay] = item;
      }
    }

    // make object to query easily
    let Globaldaydata: Record<number, Globaldata["globalInfos"][0]> = {};
    for (let i = 0; i < globaldata.globaldata.length; i++) {
      let item = globaldata.globaldata[i];
      let hexDay = item.hexDay;

      if (!Daydata.hasOwnProperty(hexDay)) {
        Daydata[hexDay] = item;
      }
    }

    //state varibale
    let stakeCount = 0;
    let totalStakeLength = 0;

    let AverageStakeL = 0;
    let Staked = 0;
    let TotalProfit = 0;
    let TotalTshare = 0;
    let Totalhex=0;
    // filter end of stake data
    const filteredStakeStarts = stakeStarts.filter((start) => {
      return !stakeEnds.some((end) => end.stakeId === start.stakeId);
    });

    const stake = filteredStakeStarts.map((stakeRecord: stakeStarts, indx) => {
      const {
        stakeId,
        stakedHearts,
        startDay,
        endDay,
        stakedDays,
        stakeShares,
        stakeTShares,
      } = stakeRecord;
      stakeCount += 1;
      Staked += Number(stakedHearts) / 10 ** 8;
      totalStakeLength += Number(stakedDays);
      TotalTshare += Number(stakeTShares);


      for (
        let day = Number(startDay);
        day <=
        (currentHexday > Number(endDay) ? Number(endDay) : currentHexday);
        day++
      ) {
        //get day data
        const { payoutPerTShare, payout } = Daydata[day];
        const rewardDaily = payoutPerTShare * stakeTShares;

        TotalProfit += rewardDaily;
  
        // if there is big pay day
        if (day == 354) {
          const bigPayDayReward: number = calculateBigPayDayReward(stakeShares);
          TotalProfit += bigPayDayReward;
        }
      }
    });

    AverageStakeL =( totalStakeLength / stakeCount) / 365;

    res.status(200).json({
      success: true,
      message: "stake data successfully",
      stakeInfo: {
        stakeCount,
        AverageStakeL,
        TotalProfit,
        TotalTshare,
        Staked,
        Totalhex:Totalhex+TotalProfit
      },
    });
  }
);
