import { Request, Response } from "express";
import { request, gql } from "graphql-request";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import weekOfYear from "dayjs/plugin/weekOfYear";

dayjs.extend(utc);
dayjs.extend(weekOfYear);

const DAYDATA_INFO = gql`
  query dailyDataUpdates($skip: Int!) {
    dailyDataUpdates(
      first: 1000
      skip: $skip
      orderBy: endDay
      orderDirection: asc
      subgraphError: allow
    ) {
      beginDay
      endDay
      payout
      payoutPerTShare
      shares
      timestamp
    }
  }
`;

export interface DataResults {
  dailyDataUpdates: {
    timestamp: number;
    endDay: number;
    payout: number;
    payoutPerTShare: number;
    shares: number;
    beginDay:number
  }[];
}

export async function fetchDaydataData(client: string) {
  try {
    const maxRetries = 3;
    let retries = 0;
    let data: DataResults["dailyDataUpdates"] = [];
    let skip = 0;
    console.log("skipAA", skip);

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

          const daydata = await request<DataResults>(
            client,
            DAYDATA_INFO,
            variables
          );

          if (daydata && daydata.dailyDataUpdates.length > 0) {
            data = data.concat(daydata.dailyDataUpdates);
            skip += daydata.dailyDataUpdates.length;
            console.log(`Skip: ${skip}`);
            console.log(`Data Length: ${data.length}`);
          } else {
            break; // No more data to fetch
          }
        } catch (error) {
          console.error("GraphQL request error:", error);

          retries += 1;

          if (retries <= maxRetries) {
            console.log(`Retry attempt ${retries}`);
            // Introduce a delay before the next retry (e.g., wait for 1 second)
            await new Promise((resolve) => setTimeout(resolve, 1000));
          } else {
            console.error("Max retries reached. Exiting.");
            return false;
          }
        }
      } while (true);
    };

    const fetchDataWithDelayAndRetry = async () => {
      while (await fetchDataBatchWithRetry()) {
        // Wait for the specified delay before making the next batch of requests
        await new Promise((resolve) =>
          setTimeout(resolve, delayBetweenBatches)
        );
      }
    };

    // Start fetching data in batches with a delay and retry
    await fetchDataWithDelayAndRetry();

    return {
      data: data,
      error: false,
    };
  } catch (e) {
    // Handle errors
    console.error(e);
    return {
      data: [],
      error: true,
    };
  }
}
