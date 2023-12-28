import { request, gql } from "graphql-request";
import { TokennetworkClient } from "../../../utils/dataClient";
import { useDeltaTimestamps } from "../../../utils/queries";
import { getBlocksFromTimestamps } from "../../../utils/getBlocksFromTimestamps";
const GLOBAL_TRANSACTIONS_ETH = gql`
  query transactions(
    $address: Bytes!
    $swapsAs0skip: Int!
    $swapsAs1skip: Int!
    $timestamp_gt: String!
  ) {
    swapsAs0: swaps(
      first: 1000
      skip: $swapsAs0skip
      orderBy: timestamp
      orderDirection: desc
      where: { token0: $address, timestamp_gt: $timestamp_gt }
      subgraphError: allow
    ) {
      timestamp
      transaction {
        id
      }

      pool {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }

      origin
      amount0
      amount1
      amountUSD
    }
    swapsAs1: swaps(
      first: 1000
      skip: $swapsAs1skip
      orderBy: timestamp
      orderDirection: desc
      where: { token1: $address, timestamp_gt: $timestamp_gt }
      subgraphError: allow
    ) {
      timestamp
      transaction {
        id
      }
      pool {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      origin
      amount0
      amount1
      amountUSD
    }
  }
`;

const GLOBAL_TRANSACTIONS_PLX = gql`
  query transactions(
    $address: Bytes!
    $swapsAs0skip: Int!
    $swapsAs1skip: Int!
    $timestamp_gt: String!
  ) {
    swapsAs0: swaps(
      first: 1000
      skip: $swapsAs0skip
      orderBy: timestamp
      orderDirection: desc
      where: { token0: $address, timestamp_gt: $timestamp_gt }
      subgraphError: allow
    ) {
      timestamp
      transaction {
        id
      }

      pair {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }

      from
      amountUSD
    }
    swapsAs1: swaps(
      first: 1000
      skip: $swapsAs1skip
      orderBy: timestamp
      orderDirection: desc
      where: { token1: $address, timestamp_gt: $timestamp_gt }
      subgraphError: allow
    ) {
      timestamp
      transaction {
        id
      }
      pair {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }

      amountUSD
    }
  }
`;

interface TransactionResults {
  swapsAs0: {
    timestamp: string;
    transaction: {
      id: string;
    };
    pool: {
      token0: {
        id: string;
        symbol: string;
      };
      token1: {
        id: string;
        symbol: string;
      };
    };
    origin: string;
    amount0: string;
    amount1: string;
    amountUSD: string;
  }[];
  swapsAs1: {
    timestamp: string;
    transaction: {
      id: string;
    };
    pool: {
      token0: {
        id: string;
        symbol: string;
      };
      token1: {
        id: string;
        symbol: string;
      };
    };
    origin: string;
    amount0: string;
    amount1: string;
    amountUSD: string;
  }[];
}

export async function fetchTokenTransactions(id: number, address: string) {
  try {
    const maxRetries = 100;
    let data: any[] = [];
    let swapsAs0: any[] = [];
    let swapsAs1: any[] = [];
    let swapsAs0skip = 0;
    let swapsAs1skip = 0;

    const [t24, t48, tWeek] = useDeltaTimestamps();

    const blocks = await getBlocksFromTimestamps(
      [t24, t48, tWeek],
      "asc",
      1000,
      id
    );
    const batchSize = 1000;
    const delayBetweenBatches = 10; // 2 seconds
    let totalRecords = 0;

    const fetchDataBatchWithRetry = async () => {
      let retries = 0;

      do {
        try {
          const variables = {
            first: batchSize,
            swapsAs0skip,
            swapsAs1skip,
            address: address.toLowerCase(),
            timestamp_gt: t24.toString(),
            chainId: id,
          };

          const transactionData = await request<TransactionResults>(
            TokennetworkClient[id],
            id == 1 ? GLOBAL_TRANSACTIONS_ETH : GLOBAL_TRANSACTIONS_PLX,
            variables
          );

          if (
            (transactionData && transactionData.swapsAs0.length > 0) ||
            transactionData.swapsAs1.length > 0
          ) {
            console.log("swapsAs0skip", swapsAs0skip);
            console.log("swapsAs1skip", swapsAs1skip);
            swapsAs0 = swapsAs0.concat(transactionData.swapsAs0);
            swapsAs1 = swapsAs1.concat(transactionData.swapsAs1);
            swapsAs0skip += transactionData.swapsAs0.length;
            swapsAs1skip += transactionData.swapsAs1.length;
            console.log("swapsAs0skip", swapsAs0skip);
            console.log("swapsAs1skip", swapsAs1skip);
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

    const swaps0 = swapsAs0.map((m) => {
        return {
          hash: m.transaction.id,
          timestamp: m.timestamp,
          token0Symbol:  id == 1 ? m.pool.token0.symbol: m.pair.token0.symbol,
          token1Symbol: id == 1 ? m.pool.token1.symbol: m.pair.token1.symbol,
          token0Address: id == 1 ? m.pool.token0.id : m.pair.token0.id ,
          token1Address:id == 1 ? m.pool.token1.id : m.pair.token1.id,
          amountUSD: parseFloat(m.amountUSD),
          amountToken0: parseFloat(m.amount0),
          amountToken1: parseFloat(m.amount1),
        }
      })
  
      const swaps1 = swapsAs1.map((m) => {
        return {
          hash: m.transaction.id,
          timestamp: m.timestamp,
          token0Symbol:  id == 1 ? m.pool.token0.symbol: m.pair.token0.symbol,
          token1Symbol: id == 1 ? m.pool.token1.symbol: m.pair.token1.symbol,
          token0Address: id == 1 ? m.pool.token0.id : m.pair.token0.id ,
          token1Address:id == 1 ? m.pool.token1.id : m.pair.token1.id,
          amountUSD: parseFloat(m.amountUSD),
          amountToken0: parseFloat(m.amount0),
          amountToken1: parseFloat(m.amount1),
        }
      })


    data = [...swaps0, ...swaps1];

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
