import { fetchGlobalData } from "../helper/globaldata";
import { fetchTokenData, fetchHexMarketChart } from "../helper/hexprice";
import { fetchShareRateData } from "../helper/shareRate";
import globalschema from "../Models/GlobalInfo";
import { DataResults } from "../helper/globaldata";
import { TokendaydataClient } from "./dataClient";
import { Tokenaddress } from "../config/index";

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
  lastSync: number,
  id: number
): Promise<FetchAndUpdateResult> => {
  const url = process.env.Eglobalgraph || "";

  try {
    const GlobalData: any = await fetchGlobalData(url, lastSync);
    let Pricedatadata;

    if (id === 1) {
      const fetchdata = await fetchHexMarketChart();
      Pricedatadata = fetchdata.map((e: any) => ({
        timestamp: e[0] / 1000,
        price: e[1],
      }));
    } else {
      const price = await fetchTokenData(Tokenaddress, TokendaydataClient[id]);
      Pricedatadata = price.data;
    }

    const filter = { id: id };

    /// graph data
    const globaldata = GlobalData.data;

    if (globaldata.length > 0) {
      const update = {
        $push: {
          globaldata: { $each: globaldata },
        },
      };
      // this is needed if we resync from 0
      // const update = {
      //   $set: {
      //     globaldata: globaldata,
      //   },
      // };

      const options = { new: true };
      const updatedDocument = await globalschema.findOneAndUpdate(
        filter,
        update,
        options
      );
    }

    const AfterUpdate = await globalschema.findOne({ id });

    let uniqueData: Record<number, DataResults["globalInfos"][0]> = {};
    for (let i = 0; i < AfterUpdate.globaldata.length; i++) {
      let item = AfterUpdate.globaldata[i];
      let hexDay = item.hexDay;

      if (!uniqueData.hasOwnProperty(hexDay)) {
        uniqueData[hexDay] = item;
      }
    }

    const lastSyncIDstored = GlobalData.lastSyncID;

    const Tshare: Array<TshareData> = Pricedatadata.map((e: any) => {
      const { timestamp, price } = e;
      const i = Math.ceil(timestamp / 86400 - 18233);
      const shareRate = Number(uniqueData[i]?.shareRate || 0);
      const tshareprice = isNaN(shareRate)
        ? 0
        : (Number(price) * shareRate) / 10;
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
