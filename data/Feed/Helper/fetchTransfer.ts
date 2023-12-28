import { request, gql } from "graphql-request";
import { TokendataClient } from "../../../utils/dataClient";
const SEND_INFO = gql`
  query transfers($skip: Int!, $timestamp_gt: String!) {
    transfers(
      first: 1000
      skip: $skip
      orderBy: timestamp
      orderDirection: asc
      subgraphError: allow
      where: { timestamp_gt: $timestamp_gt }
    ) {
    timestamp
    to
    value
    methodId
    from
    }
  }
`;

export interface DataResults {
    transfers: {
    timestamp: string; //
    to:string,
    methodId:any,
    value:string
    from:string
  }[];
}

export async function fetchTransfer(id: number, timestamp_gt: string) {
  try {
    const maxRetries = 100;
    let retries = 0;
    let data: DataResults["transfers"] = [];
    let skip = 0;

    const batchSize = 1000;
    const delayBetweenBatches = 10; // 2 seconds


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
            SEND_INFO,
            variables
          );

          if (stakedata && stakedata.transfers.length > 0) {
            data = data.concat(stakedata.transfers);
            skip += stakedata.transfers.length;
        

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
      error: false,
    };
  } catch (e) {
    // Handle errors
    console.error(e);
    return {
      data: undefined,
      error: true
    };
  }
}
