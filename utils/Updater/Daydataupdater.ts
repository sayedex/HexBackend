import { TokendataClient } from "../dataClient";
import { fetchDaydataData } from "../../helper/daydata";
import globalschema from "../../Models/GlobalInfo";

export const fetchAndupdatedDaydata = async (id: number) => {
  const filter = { id: id };
  const options = { new: true };

  const data = await fetchDaydataData(TokendataClient[id]);

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
