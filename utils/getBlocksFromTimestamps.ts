
import { request, gql } from "graphql-request";
import { multiQuery } from "./queries";
import { networkClient } from "./dataClient";
import orderBy from "lodash/orderBy";


const getBlockSubqueries = (timestamps: number[]) =>
  timestamps.map((timestamp) => {
    return `t${timestamp}:blocks(first: 1, orderBy: timestamp, orderDirection: desc, where: { timestamp_gt: ${timestamp}, timestamp_lt: ${
      timestamp + 400
    } }) {
      number
    }`;
  });

const blocksQueryConstructor: any = (subqueries: string[]) => {
  return gql`query blocks {
    ${subqueries}
  }`;
};

export const getBlocksFromTimestamps = async (
  timestamps: number[],
  sortDirection: "asc" | "desc" | undefined = "desc",
  skipCount: number | undefined = 500,
  chainId: number
): Promise<any> => {
  if (timestamps?.length === 0) {
    return [];
  }

  const fetchedData: any = await multiQuery(
    blocksQueryConstructor,
    getBlockSubqueries(timestamps),
    networkClient[chainId],
    skipCount
  );

  
  const blocks: any[] = [];
  if (fetchedData) {
    // eslint-disable-next-line no-restricted-syntax
    for (const key of Object.keys(fetchedData)) {
      if (fetchedData[key].length > 0) {
        blocks.push({
          timestamp: key.split("t")[1],
          number: parseInt(fetchedData[key][0].number, 10),
        });
      }
    }
    // graphql-request does not guarantee same ordering of batched requests subqueries, hence manual sorting
    return blocks
  }
  return blocks;
};