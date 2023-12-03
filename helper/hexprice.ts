import { request, gql } from "graphql-request";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import weekOfYear from "dayjs/plugin/weekOfYear";
// format dayjs with the libraries that we need
dayjs.extend(utc);
dayjs.extend(weekOfYear);
export const startTimestamp = 1575341638;
const ONE_DAY_UNIX = 24 * 60 * 60;

const TOKEN_CHART = gql`
  query tokenDayDatas($skip: Int!, $address: Bytes!) {
    tokenDayDatas(
      first: 1000
      skip: $skip
      where: { token: $address }
      orderBy: date
      orderDirection: asc
      subgraphError: allow
    ) {
      date
      priceUSD
    }
  }
`;

interface ChartResults {
  tokenDayDatas: {
    date: number;
    priceUSD: string;
  }[];
}

export async function fetchTokenData(address: string, client: string) {
  let data: {
    date: number;
    priceUSD: string;
  }[] = [];

  const endTimestamp = dayjs.utc().unix();

  let error = false;
  let skip = 0;

  do {
    const variables = {
      skip,
      address,
    };

    const chartResData = await request<ChartResults>(
      client,
      TOKEN_CHART,
      variables
    );

    if (chartResData && chartResData.tokenDayDatas.length > 0) {
      data = data.concat(chartResData.tokenDayDatas);
      skip += chartResData.tokenDayDatas.length;
      console.log(`Skip: ${skip}`);
      console.log(`Data Length: ${data.length}`);
    } else {
      break; // No more data to fetch
    }
  } while (true);

  console.log(data.length);

  if (data.length > 0) {
    const formattedExisting: { [date: number]: any } = data.reduce(
      (accum: any, dayData) => {
        const roundedDate = parseInt((dayData.date / ONE_DAY_UNIX).toFixed(0));

        accum[roundedDate] = {
          timestamp: dayData.date,
          price: parseFloat(dayData.priceUSD),
        };
        return accum;
      },
      {}
    );

    const firstEntry =
      formattedExisting[parseInt(Object.keys(formattedExisting)[0])];

    // fill in empty days (there will be no day datas if no trades made that day)
    let timestamp = firstEntry?.date ?? endTimestamp;
    let latestPrice = firstEntry?.priceUSD ?? 0; // Initialize latestPrice

    while (timestamp < endTimestamp) {
      const nextDay = timestamp + ONE_DAY_UNIX;
      const currentDayIndex = parseInt((nextDay / ONE_DAY_UNIX).toFixed(0));
      if (
        !Object.keys(formattedExisting).includes(currentDayIndex.toString())
      ) {
        formattedExisting[currentDayIndex] = {
          timestamp: nextDay,
          price: latestPrice,
        };
      } else {
        latestPrice = formattedExisting[currentDayIndex].price; // Update latestPrice
      }
      timestamp = nextDay;
    }

    const dateMap = Object.keys(formattedExisting).map(
      (key) => formattedExisting[parseInt(key)]
    );
    // Filter out entries where priceUSD is 0
    const filteredData = Object.keys(formattedExisting)
      .map((key) => formattedExisting[parseInt(key)])
      .filter((entry) => entry.price !== 0);

    return {
      data: filteredData,
      error: false,
    };
  } else {
    return {
      data: undefined,
      error,
    };
  }
}

import axios from "axios";

const COINGECKO_API_URL = "https://api.coingecko.com/api/v3";

export async function fetchHexMarketChart(): Promise<any> {
  const url = `${COINGECKO_API_URL}/coins/hex/market_chart`;
  const params = {
    vs_currency: "usd",
    days: "max",
  };

  try {
    const response = await axios.get(url, { params });
    return response.data.prices;
  } catch (error) {
    console.error("Error fetching Hex market chart data:", error);
    throw error; // You can handle errors as needed in your application
  }
}
