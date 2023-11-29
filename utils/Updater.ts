import { fetchGlobalData } from "../helper/globaldata";
import { fetchTokenData, fetchHexMarketChart } from "../helper/hexprice";
import { fetchShareRateData } from "../helper/shareRate";
import globalschema from "../Models/GlobalInfo";
import { DataResults } from "../helper/globaldata";
import { fetchDaydataData } from "../helper/daydata";
interface TshareData {
  date: number;
  hexday: number;
  tshare: number;
}

interface GlobalData {
  data: Array<any>; // You may need to specify a more specific type
  lastSyncID: number;
  // Add other properties from your actual GlobalData type
}

interface FetchAndUpdateResult {
  Tshare: Array<TshareData>;
  lastSyncIDstored: number;
}

export const fetchAndupdateGlobaldata = async (
  lastSync: number
): Promise<FetchAndUpdateResult> => {
  const url = process.env.Eglobalgraph || "";

  try {
    const GlobalData: any = await fetchGlobalData(url, lastSync);

    const data = await fetchHexMarketChart();
    const filter = { _id: "655e120ac4c518c7da0cc355" };

    /// graph data
    const globaldata = GlobalData.data;

    if (globaldata.length > 0) {
      const update = {
        $push: {
          globaldata: { $each: globaldata },
        },
      };
      const options = { new: true };
      const updatedDocument = await globalschema.findOneAndUpdate(
        filter,
        update,
        options
      );
    }

    const AfterUpdate = await globalschema.findById("655e120ac4c518c7da0cc355");

    let uniqueData: Record<number, DataResults["globalInfos"][0]> = {};
    for (let i = 0; i < AfterUpdate.globaldata.length; i++) {
      let item = AfterUpdate.globaldata[i];
      let hexDay = item.hexDay;

      if (!uniqueData.hasOwnProperty(hexDay)) {
        uniqueData[hexDay] = item;
      }
    }

    const lastSyncIDstored = GlobalData.lastSyncID;

    const Tshare: Array<TshareData> = data.map((e: any) => {
      const [timestamp, value] = e;
      const i = Math.ceil(timestamp / 1000 / 86400 - 18233);
      const shareRate = Number(uniqueData[i]?.shareRate || 0);
      const tshareprice = isNaN(shareRate)
        ? 0
        : (Number(value) * shareRate) / 10;
      return { timestamp: timestamp, hexday: i, tshare: tshareprice };
    });

    if (Tshare.length > 0) {
      return { Tshare, lastSyncIDstored };
    } else {
      return { Tshare: [], lastSyncIDstored };
    }
  } catch (error) {
    // Handle the error
    console.error("An error occurred:", error);
    // You might want to throw the error if you want to propagate it
    throw error;
  }
};

/// Hex price update worker
export const fetchAndupdateHexprice = async (id: string) => {
  const filter = { _id: id };
  const options = { new: true };

  const data = await fetchHexMarketChart();

  const price = data.map((e: any) => {
    const [timestamp, price] = e;
    return {
      timestamp: timestamp,
      price: price,
    };
  });

  const update = {
    $set: {
      pricedata: price,
    },
  };

  if (price.length > 0) {
    const updatedDocument = await globalschema.findOneAndUpdate(
      filter,
      update,
      options
    );

    return { isdone: true };
  } else {
    return { isdone: false };
  }
};


export const fetchAndupdatedDaydata = async (id: string) => {
  const filter = { _id: id };
  const options = { new: true };

  const data = await fetchDaydataData("https://api.thegraph.com/subgraphs/name/codeakk/hex");


  const update = {
    $set: {
      daydata: data.data,
    },
  };

  if (data.data.length > 0) {
    const updatedDocument = await globalschema.findOneAndUpdate(
      filter,
      update,
      options
    );

    return { isdone: true };
  } else {
    return { isdone: false };
  }
};
