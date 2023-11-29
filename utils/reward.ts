
export function calculateBigPayDayReward(
    stakeSharesA: number
  ): number {
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