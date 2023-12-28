import dayjs from "dayjs";
import { request } from 'graphql-request';
import { GraphQLClient } from 'graphql-request';
import requestWithTimeout from "./requestWithTimeout";

export const multiQuery = async (
    queryConstructor: (subqueries: string[]) => string,
    subqueries: string[],
    endpoint: string,
    skipCount = 1000,
  ) => {
    let fetchedData = {}
    let allFound = false
    let skip = 0
    const client = new GraphQLClient(endpoint)
    try {
      while (!allFound) {
        let end = subqueries.length
        if (skip + skipCount < subqueries.length) {
          end = skip + skipCount
        }
        const subqueriesSlice = subqueries.slice(skip, end)
        // eslint-disable-next-line no-await-in-loop
        const result: any = await requestWithTimeout(client, queryConstructor(subqueriesSlice))
        fetchedData = {
          ...fetchedData,
          ...result,
        }
        allFound = Object.keys(result).length < skipCount || skip + skipCount > subqueries.length
        skip += skipCount
      }
      return fetchedData
    } catch (error) {
      console.error('Failed to fetch info data', error)
      return null
    }
  }





export function useDeltaTimestamps(): [number, number, number] {
  const utcCurrentTime = dayjs();
  const t1 = utcCurrentTime.subtract(1, "day").startOf("minute").unix();
  const t2 = utcCurrentTime.subtract(2, "day").startOf("minute").unix();
  const tWeek = utcCurrentTime.subtract(1, "week").startOf("minute").unix();
  return [t1, t2, tWeek];
}
