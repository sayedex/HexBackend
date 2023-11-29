// bid bost
// Serge buff

export const BidBost = {
    name: "Silvervolt Bid Boost",
    type: "boost",
    maxValue: 5,
    tier: [
      { min: 2, max: 5 },
      { min: 2, max: 4 },
      { min: 1, max: 3 },
      { min: 1, max: 2 },
      { min: 1, max: 1 },
      // added for "standard"
      { min: 1, max: 1 },
    ],
  };
  
  // Might buff
  export const MiningBoost = {
    name: "Silvervolt Mining Boost",
    type: "boost",
    maxValue: 10,
    tier: [
      { min: 6, max: 1 },
      { min: 5, max: 8 },
      { min: 4, max: 6 },
      { min: 2, max: 5 },
      { min: 5, max: 4 },
    ],
  };
  
  // Resilience buff
  export const ReferralBoost = {
    name: "Silvervolt Referral Boost",
    type: "boost",
    maxValue: 6,
    tier: [
      { min: 2, max: 4 },
      { min: 1.5, max: 3 },
      { min: 1, max: 2 },
      { min: 0.6, max: 1.5 },
      { min: 0.5, max: 1 },
      // added for "standard"
      { min: 0.25, max: 0.5 },
    ],
  };
  
  // Wit
  export const DiamondDiscount = {
    name: "Silvervolt Wheel Spin Diamond Discount",
    type: "bonus",
    maxValue: 0,
    tier: [
      { min: [1, 14, 29], max: [1, 19, 38] },
      { min: [1, 12, 24], max: [1, 17, 34] },
      { min: [1, 10, 19], max: [1, 14, 29] },
      { min: [1, 7, 14], max: [1, 12, 24] },
      { min: [1, 5, 10], max: [1, 10, 19] },
      // added for "standard"
      { min: [1, 2, 5], max: [1, 5, 9] },
    ],
  };
  
  //luck
  export const LotteryDiamondDiscount = {
    name: "Silvervolt Lottery Diamond Discount",
    type: "bonus",
    maxValue: 0,
    tier: [
      { min: [1, 14, 29], max: [1, 19, 38] },
      { min: [1, 12, 24], max: [1, 17, 34] },
      { min: [1, 10, 19], max: [1, 14, 29] },
      { min: [1, 7, 14], max: [1, 12, 24] },
      { min: [1, 5, 10], max: [1, 10, 19] },
      // added for "standard"
      { min: [1, 2, 5], max: [1, 5, 9] },
    ],
  };
  