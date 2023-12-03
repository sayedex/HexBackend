import { Request, Response } from "express";
import { request, gql } from "graphql-request";

const STAKE_INFO = gql`
  query Stakeinfo($stakerAddr: Bytes!) {
    stakeStarts: stakeStarts(
      first: 100
      orderBy: timestamp
      orderDirection: asc
      subgraphError: allow
      where: { stakerAddr: $stakerAddr }
    ) {
      stakeId
      stakeShares
      stakeTShares
      stakedDays
      stakedHearts
      stakerAddr
      startDay
      timestamp
      endDay
    }
    stakeEnds: stakeEnds(
      first: 100
      orderBy: timestamp
      orderDirection: asc
      subgraphError: allow
      where: { stakerAddr: $stakerAddr }
    ) {
      penalty
      payout
      prevUnlocked
      servedDays
      stakeId
      stakedHearts
      stakedShares
      stakerAddr
      timestamp
    }
  }
`;

export interface stakeStarts {
  stakeId: number;
  stakeShares: number;
  stakeTShares: number;
  stakedDays: number;
  stakedHearts: number;
  stakerAddr: string;
  startDay: number;
  timestamp: number;
  endDay: number;
}
interface stakeEnds {
  penalty: number;
  payout: number;
  prevUnlocked: number;
  servedDays: number;
  stakeId: number;
  stakedHearts: number;
  stakedShares: number;
  stakerAddrr: string;
  timestamp: number;
}

interface Stakeinfo {
  stakeStarts: stakeStarts[];
  stakeEnds: stakeEnds[];
}

export async function fetchStakedata(stakerAddr: string, client: string) {
  let data: {
    date: number;
    priceUSD: string;
  }[] = [];

  try {
    let error = false;
    let skip = 0;

    const variables = {
      stakerAddr,
    };

    console.log(variables);

    const StakeResData = await request<Stakeinfo>(
      client,
      STAKE_INFO,
      variables
    );

    const { stakeStarts, stakeEnds } = StakeResData;
    return {
      stakeStarts: stakeStarts,
      stakeEnds: stakeEnds,
      error: false,
      errorText: [],
    };
  } catch (error) {
    return {
      stakeStarts: [],
      stakeEnds: [],
      error: true,
      errorText: error,
    };
  }
}
