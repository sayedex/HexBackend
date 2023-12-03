import { fetchAndupdateGlobaldata } from "../../utils/Updater";
import globalschema from "../../Models/GlobalInfo";
export const updateGlobalData = async (id: number) => {
  console.log("working id", id);
  const lastSync = await globalschema.findOne({ id: id });

  if (lastSync) {
    const lastSyncdocument = await lastSync.LastupdateidETH;

    const { Tshare, lastSyncIDstored } = await fetchAndupdateGlobaldata(
      lastSyncdocument,
      id
    );

    if (Tshare.length > 0 && lastSyncIDstored != 0) {
      try {
        lastSync.LastupdateidETH = lastSync.LastupdateidETH + lastSyncIDstored;
        lastSync.TshareDataETH = Tshare;
        const updatedLastSync = await lastSync.save();
      } catch (error) {
        console.log(error);
      }
    }
    console.log("done...", id);
  }
};
