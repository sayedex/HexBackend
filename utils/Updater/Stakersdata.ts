import { fetchAndupdateGlobaldata } from "../../utils/Updater";
import { getChainModel } from "../../Models/Chain";
import { fetchALLStakedata } from "../../helper/allstakedata";
const NUM_UPDATES_PER_CHAIN = 1; // Set the desired number of updates per ChainId

export const updateStakersdata = async (id: number) => {
  console.log("working id updateStakersdata", id);
  for (
    let updateCount = 0;
    updateCount < NUM_UPDATES_PER_CHAIN;
    updateCount++
  ) {
    const bulkOps: any = [];
    const chainModel:any = getChainModel(id);
    
    const lastSync = await chainModel.findOne({ id: id });

    if (lastSync) {
      const lastSyncdocument = await lastSync.Lastsyncupdated;

      const { lastSyncID, data } = await fetchALLStakedata(
        id,
        lastSyncdocument
      );

      if (data && data.length > 0 && lastSyncID !== 0) {
        try {
          const uniqueData = removeDuplicates(data, "stakerAddr");

          const existingStakerAddresses = new Set(
            lastSync.stakers.map((staker: any) => staker.stakerAddr)
          );

          const stakersToPush: any = uniqueData.filter(
            (staker) => !existingStakerAddresses.has(staker.stakerAddr)
          );
          const numberOfExistingStakers = existingStakerAddresses.size;
   
          const totalStakers = numberOfExistingStakers + stakersToPush.length;
        
          
        
          if (stakersToPush.length > 0) {
        
            bulkOps.push({
              updateOne: {
                filter: { id: id },
                update: {
                  $push: { stakers: { $each: stakersToPush } },
                  $inc: { Lastsyncupdated: lastSyncID },
                  $set: { totalstakers: totalStakers },

                },
                upsert: true,
              },
            });
            await chainModel.bulkWrite(bulkOps);
          }

          console.log("Bulk update or insert completed for id", id);
        } catch (error) {
          console.log(error);
        }
      }
      console.log("done...", id);
    }
  }
};

function removeDuplicates<T>(array: T[], key: keyof T): T[] {
  return array.filter(
    (item, index, self) =>
      index ===
      self.findIndex((i) => (i[key] as unknown) === (item[key] as unknown))
  );
}
