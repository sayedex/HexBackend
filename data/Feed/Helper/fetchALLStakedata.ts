import { request, gql } from "graphql-request";
import { TokendataClient } from "../../../utils/dataClient";
const STAKE_INFO = gql`
  query Stakeinfo($skip: Int!, $timestamp_gt: String!) {
    stakeStarts(
      first: 1000
      skip: $skip
      orderBy: timestamp
      orderDirection: asc
      subgraphError: allow
      where: { timestamp_gt: $timestamp_gt }
    ) {
      stakeId
      stakeTShares
      stakeShares
      stakerAddr
      stakedHearts
      timestamp
      stakedDays
    }
  }
`;

export interface DataResults {
  stakeStarts: {
     stakeId: number;
    stakeShares: number;
     stakeTShares: number;
     stakedDays: number;
     stakedHearts: number;
    stakerAddr: string;
    // startDay: number;
    timestamp: number;
    // endDay: number;
  }[];
}

export async function fetchALLStakedata(id: number, timestamp_gt: string) {
  try {
    const maxRetries = 100;
    let retries = 0;
    let data: DataResults["stakeStarts"] = [];
    let skip = 0;

    const batchSize = 1000;
    const delayBetweenBatches = 10; // 2 seconds
    let totalRecords = 0;

    const fetchDataBatchWithRetry = async () => {
      let retries = 0;

      do {
        try {
          const variables = {
            first: batchSize,
            skip,
            timestamp_gt: timestamp_gt,
          };

          const stakedata = await request<DataResults>(
            TokendataClient[id],
            STAKE_INFO,
            variables
          );

          if (stakedata && stakedata.stakeStarts.length > 0) {
            data = data.concat(stakedata.stakeStarts);
            skip += stakedata.stakeStarts.length;
            totalRecords += stakedata.stakeStarts.length;

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
            await new Promise((resolve) => setTimeout(resolve, 10000));
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
      totalRecords,
      error: false,
    };
  } catch (e) {
    // Handle errors
    console.error(e);
    return {
      data: undefined,
      error: true,
      totalRecords: 0,
    };
  }
}
