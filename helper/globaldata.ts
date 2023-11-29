import { Request, Response } from 'express';
import { request, gql } from 'graphql-request';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import weekOfYear from 'dayjs/plugin/weekOfYear';

dayjs.extend(utc);
dayjs.extend(weekOfYear);

const GLOBAL_INFO = gql`
  query globalInfos($skip: Int!) {
    globalInfos(
      first: 1000
      skip: $skip
      orderBy: hexDay
      orderDirection: asc
      subgraphError: allow
    ) {
      timestamp
      shareRate
      hexDay
      latestStakeId
      globalInfoCount
    }
  }
`;

export interface DataResults {
  globalInfos: {
    timestamp: number;
    shareRate: string;
    latestStakeId: string;
    hexDay: number;
  }[];
}

export async function fetchGlobalData(client: string,lastSync:number) {
  try {
    const maxRetries = 3;
    let retries = 0;
    let data: DataResults['globalInfos'] = [];
    let skip = lastSync;
    console.log("skipAA",skip);
    
    
    const batchSize = 1000;
    const delayBetweenBatches = 2000; // 2 seconds
    
    const fetchDataBatchWithRetry = async () => {
      let retries = 0;
    
      do {
        try {
          const variables = {
            first: batchSize,
            skip,
          };
    
          const globalInfos = await request<DataResults>(client, GLOBAL_INFO, variables);
    
          if (globalInfos && globalInfos.globalInfos.length > 0) {
            data = data.concat(globalInfos.globalInfos);
            skip += globalInfos.globalInfos.length;
            console.log(`Skip: ${skip}`);
            console.log(`Data Length: ${data.length}`);
          } else {
            break; // No more data to fetch
          }
        } catch (error) {
          console.error('GraphQL request error:', error);
    
          retries += 1;
    
          if (retries <= maxRetries) {
            console.log(`Retry attempt ${retries}`);
            // Introduce a delay before the next retry (e.g., wait for 1 second)
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            console.error('Max retries reached. Exiting.');
            return false;
          }
        }
      } while (true);
    };

    
    
    const fetchDataWithDelayAndRetry = async () => {
      while (await fetchDataBatchWithRetry()) {
        // Wait for the specified delay before making the next batch of requests
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }
    };
    
    // Start fetching data in batches with a delay and retry
    await fetchDataWithDelayAndRetry();


    console.log("all data fetch");
    

    let uniqueData: Record<number, DataResults['globalInfos'][0]> = {};
    for (let i = 0; i < data.length; i++) {
      let item = data[i];
      let hexDay = item.hexDay;

      if (!uniqueData.hasOwnProperty(hexDay)) {
        uniqueData[hexDay] = item;
      }
    }

    return {
      data: Object.values(uniqueData),
      lastSyncID:data.length,
      error: false,
    };
  } catch (e) {
    // Handle errors
    console.error(e);
    return {
      data: undefined,
      error: true,
      lastSyncID:0
    };
  }
}

