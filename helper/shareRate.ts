import { Request, Response } from 'express';
import { request, gql } from 'graphql-request';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import weekOfYear from 'dayjs/plugin/weekOfYear';

dayjs.extend(utc);
dayjs.extend(weekOfYear);

const SHARE_RATE = gql`
  query shareRateChanges($skip: Int!) {
    shareRateChanges(
      first: 1000
      skip: $skip
      orderBy: timestamp
      orderDirection: asc
      subgraphError: allow
    ) {
      timestamp
      shareRate
    }
  }
`;

interface DataResults {
    shareRateChanges: {
    timestamp: number;
    shareRate: string
  }[];
}

export async function fetchShareRateData(client: string) {
  try {
    let data: DataResults['shareRateChanges'] = [];
    let skip = 0;

    do {
      const variables = {
        first: 1000,
        skip,
      };

      const shareRateChange = await request<DataResults>(client, SHARE_RATE, variables);

      if (shareRateChange && shareRateChange.shareRateChanges.length > 0) {
        data = data.concat(shareRateChange.shareRateChanges);
        skip += shareRateChange.shareRateChanges.length;
      } else {
        break; // No more data to fetch
      }
    } while (true);
    let uniqueData: Record<number, DataResults['shareRateChanges'][0]> = {};
    for (let i = 0; i < data.length; i++) {
        let item = data[i];
      const hexDay = (item.timestamp) / 86400 - 18233;

      if (!uniqueData.hasOwnProperty(hexDay)) {
        uniqueData[hexDay] = item;
      }
    }

    return {
      data: uniqueData,
      error: false,
    };

    return {
      data: data,
      error: false,
    };
  } catch (e) {
    // Handle errors
    console.error(e);
    return {
      data: undefined,
      error: true,
    };
  }
}

