import { fetchHexMarketChart, fetchTokenData } from "../../helper/hexprice";
import globalschema from "../../Models/GlobalInfo";
import { TokendaydataClient } from "../dataClient";
import { Tokenaddress } from "../../config";

export const fetchAndupdateHexprice = async (id: number) => {
  const filter = { id: id };
  const options = { new: true };
  let data;
  let price;

  if (id == 1) {
    data = await fetchHexMarketChart();
  } else {
    const price = await fetchTokenData(Tokenaddress, TokendaydataClient[id]);
    data = price.data;
  }

  if (id == 1) {
    price = data.map((e: any) => {
      const [timestamp, price] = e;
      return {
        timestamp: timestamp / 1000,
        price: price,
      };
    });
  } else {
    price = data;
  }

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
