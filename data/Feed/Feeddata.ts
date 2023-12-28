import { request, gql } from "graphql-request";
import { useDeltaTimestamps } from "../../utils/queries";
import { getBlocksFromTimestamps } from "../../utils/getBlocksFromTimestamps";
import { fetchALLStakedata } from "./Helper/fetchALLStakedata";
import { fetchALLEnddata } from "./Helper/fetchALLEnddata";
import { fetchTransfer } from "./Helper/fetchTransfer";
import { DataResults as stakeStarts } from "./Helper/fetchALLStakedata";
import { DataResults as stakeEnds } from "./Helper/fetchALLEnddata";
import { DataResults as transfer } from "./Helper/fetchTransfer";

interface Data {
  stakers24h: number;
  totalStaked24h: number;
  transation: transation[] | undefined;
}

enum transation_type {
  STAKE,
  UNSTAKE,
  EARLY,
  SEND,
}

interface transation {
  amount: number;
  type: transation_type;
  timestamp: string;
  toAddress?: string;
  fromAddess?: string;
  payout?: string;
  penalty?: string;
  user: string;
  earlyDay?: string;
  stakedDays?:string
}

export async function useFetchedFeedDatas(
  networkID: number
): Promise<Data> {
  let data: Data = {
    stakers24h: 0,
    totalStaked24h: 0,
    transation: undefined,
  };
  try {
    // get blocks from historic timestamps
    const [t24, t48, tWeek] = useDeltaTimestamps();
    
    const Stakedata = await fetchALLStakedata(networkID, t24.toString());
    const StakeEnddata = await fetchALLEnddata(networkID, t24.toString());
    const TransferData = await fetchTransfer(networkID, t24.toString());
    const { totalStaked, stakedata } = calculateStaked(Stakedata.data);
    const { endeddata } = calculateEndStake(StakeEnddata.data);
    const { transferdata } = calculateSendData(TransferData.data);
    let allData = [...stakedata, ...endeddata, ...transferdata].sort(
      (a, b) => parseInt(b.timestamp) - parseInt(a.timestamp)
    );
    data.totalStaked24h = totalStaked;
    data.stakers24h = stakedata.length;
    data.transation = allData;
    return data;
  } catch {
    return data;
  }
}

function calculateSendData(data: transfer["transfers"] | undefined): {
  transferdata: transation[];
} {
  let transferdata: transation[] = [];

  if (data && data.length > 0) {
    const filteredData = data.filter((item) => item.methodId === null);

    transferdata = filteredData.map((data, indx) => {
      const { methodId, value, to, from, timestamp } = data;
      const Amount = Number(value) / 10 ** 8;

      return {
        amount: Amount,
        type: transation_type.SEND,
        timestamp: timestamp.toString(),
        user: from,
        toAddress: to,
      };
    });
  }

  return { transferdata };
}

function calculateStaked(data: stakeStarts["stakeStarts"] | undefined): {
  totalStaked: number;
  stakedata: transation[];
} {
  let totalStaked = 0;
  let stakedata: transation[] = [];

  if (data && data.length > 0) {
    stakedata = data.map((stake, indx) => {
      const { timestamp, stakerAddr ,stakedDays} = stake;
      const stakeAmount = Number(stake.stakedHearts) / 10 ** 8;
      totalStaked += stakeAmount;
      return {
        amount: stakeAmount,
        type: transation_type.STAKE,
        timestamp: timestamp.toString(),
        user: stakerAddr,
        stakedDays:stakedDays.toString()
      };
    });
  }

  return { totalStaked, stakedata };
}

function calculateEndStake(data: stakeEnds["stakeEnds"] | undefined): {
  endeddata: transation[];
} {
  let endeddata: transation[] = [];

  if (data && data.length > 0) {
    endeddata = data.map((data, indx) => {
      const {
        timestamp,
        stakerAddr,
        payout,
        penalty,
        servedDays,
        stakedHearts,
        daysEarly,
      
      } = data;
      const stakeAmount = Number(stakedHearts) / 10 ** 8;
      const earlyStake = Number(daysEarly) == 0;

      return {
        amount: stakeAmount,
        type: earlyStake ? transation_type.UNSTAKE : transation_type.EARLY,
        timestamp: timestamp.toString(),
        user: stakerAddr,
        payout: (Number(payout)/10**8).toString(),
        penalty: (Number(penalty)/10**8).toString(),
        earlyDay: daysEarly,
        servedDays:servedDays.toString()
      
      };
    });
  }

  return { endeddata };
}
