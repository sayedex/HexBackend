import { request, gql } from "graphql-request";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import weekOfYear from "dayjs/plugin/weekOfYear";
import { TokendataClient } from "../utils/dataClient";

export const zeroaddress = "0x0000000000000000000000000000000000000000";
const QUERY_DATA = gql`
  query transfers {
    globalInfos: globalInfos(
      first: 1
      orderBy: timestamp
      orderDirection: desc
      subgraphError: allow
    ) {
      lockedHeartsTotal
      shareRate
      totalHeartsinCirculation
      totalMintedHearts
    }
    dailyDataUpdates: dailyDataUpdates(
      first: 1
      orderBy: timestamp
      orderDirection: desc
      subgraphError: allow
    ) {
      payoutPerTShare
      payout
    }
  }
`;
interface GlobalInfos {
  lockedHeartsTotal: string;
  shareRate: string;
  totalHeartsinCirculation: string;
  totalMintedHearts: string;
}

interface DailyDataUpdates {
  payoutPerTShare: string;
  payout: string;
}

interface QueryDataResponse {
  globalInfos: GlobalInfos[];
  dailyDataUpdates: DailyDataUpdates[];
}
interface FetchTransferDataResponse {
  data: PayoutReturndata;
  isError: boolean;
  chainId: number;
}

export interface PayoutReturndata {
  lockedHeartsTotal: number;
  shareRate: string;
  totalHeartsinCirculation: string;
  totalMintedHearts: number;
  payoutPerTShare: string;
  payout: string;
}

export async function fetchStakeAmount(
  id: number
): Promise<FetchTransferDataResponse> {
  const client = TokendataClient[id];

  try {
    const data = await request<QueryDataResponse>(client, QUERY_DATA);
    const { globalInfos, dailyDataUpdates } = data;
    const {
      lockedHeartsTotal,
      shareRate,
      totalHeartsinCirculation,
      totalMintedHearts,
    } = globalInfos[0];
    const { payoutPerTShare, payout } = dailyDataUpdates[0];

    const totalLocked = Number(lockedHeartsTotal) / 10 ** 8;
    const totalSupply = Number(totalMintedHearts) / 10 ** 8;

    const returndata = {
      lockedHeartsTotal: totalLocked,
      shareRate,
      totalHeartsinCirculation,
      totalMintedHearts: totalSupply,
      payoutPerTShare,
      payout,
    };

    return {
      data: returndata,
      isError: false,
      chainId: id,
    };
  } catch {
    return {
      data: {
        lockedHeartsTotal: 0,
        shareRate: "",
        totalHeartsinCirculation: "",
        totalMintedHearts: 0,
        payoutPerTShare: "",
        payout: "",
      },
      isError: false,
      chainId: id,
    };
  }
}
