export function calculateBigPayDayReward(stakeSharesA: number): number {
  const bigPayDayTotal: string = "0xfae0c6a6400dadc0";
  const Z: number = 27997742;
  const t: number = (stakeSharesA * 0) / Z;
  const i: number = (stakeSharesA * 0) / 910087996911001;
  const jlResult: number = t + i;

  function Kl(e: number, t: string): number {
    let i: number = (parseInt(bigPayDayTotal, 16) * e) / parseFloat(t);
    // @ts-ignore
    return (i += jlResult), i;
  }

  const result: number = Kl(stakeSharesA, "50499604051191931184");
  const resultAsNumber: number = result / 10 ** 8;
  return resultAsNumber;
}

export function calculateAPY(
  yieldAmount: number,
  stakeAmount: number,
  daysLive: number
): number {
  const apy = (yieldAmount / stakeAmount) * (365 / daysLive) * 100;
  return isNaN(apy) ? 0 : apy; // Return 0 if the calculated APY is not a number
}

export function yesterdaycalculateAPY(
  yieldAmount: number,
  stakeAmount: number
): number {
  const apy = (yieldAmount / stakeAmount) * (365 / 1) * 100;
  return isNaN(apy) ? 0 : apy; // Return 0 if the calculated APY is not a number
}

export function calculateDailyReward(apy: number, stakeAmount: number): number {
  const dailyReward = (apy / 100) * (stakeAmount / 365);
  return isNaN(dailyReward) ? 0 : dailyReward;
}

export function calculateMonthlyReward(
  apy: number,
  stakeAmount: number
): number {
  const monthlyReward = (apy / 100) * (stakeAmount / 12);
  return isNaN(monthlyReward) ? 0 : monthlyReward;
}

export function calculateYearlyReward(
  apy: number,
  stakeAmount: number
): number {
  const yearlyReward = (apy / 100) * stakeAmount;
  return isNaN(yearlyReward) ? 0 : yearlyReward;
}

export const calculateAverageStakeLength = (startDay: number, endDay: number,numberOfStakes:number) => {
  const totalStakeLengths = endDay - startDay + 1; // Total stake lengths for the current stake
  // Calculate Average Stake Length
  const averageStakeLength = totalStakeLengths / numberOfStakes;

  return averageStakeLength;
};