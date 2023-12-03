import { fetchAndupdateGlobaldata } from "../../utils/Updater";
import Stakersinfo from "../../Models/Stakersinfo";
import { fetchALLStakedata } from "../../helper/allstakedata";
export const updateStakersdata = async (id: number) => {
  console.log("working id updateStakersdata", id);
  const lastSync = await Stakersinfo.findOne({ id: id });

  if (lastSync) {
    const lastSyncdocument = await lastSync.Lastsyncupdated;

    const { lastSyncID, data } = await fetchALLStakedata(id, lastSyncdocument);

    if (data && data.length > 0 && lastSyncID != 0) {
      try {

        // Update or insert staker data in bulk
        await Stakersinfo.updateOne(
          { id: id },
          {
            $push: { Stakers: { $each: data } },
            $inc: { Lastsyncupdated: lastSyncID  },
          },
          { upsert: true }
        );

        console.log("Bulk update or insert completed for id", id);

        const staker = await Stakersinfo.findOne({ id: id });
        // get all new
        const stakerData = staker.Stakers;

        const uniqueAddresses = new Set(
          stakerData.map((staker: any) => staker.stakerAddr)
        );
        // Convert the set to an array
        const uniqueAddressesArray = Array.from(uniqueAddresses);
        // Get the count of unique addresses
        const uniqueAddressesCount = uniqueAddressesArray.length;
        staker.uniqueStakerAddresses = uniqueAddressesCount;
        await staker.save();
      } catch (error) {
        console.log(error);
      }
    }
    console.log("done...", id);
  }
};
