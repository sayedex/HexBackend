import express from "express";
import { getTest,TshareUSDprice,HexpriceChartdata,payoutPerTShare,Totalstekrs ,Feedhistory,PriceHistoryTest } from "../controllers/global.controllers";
import { getStakedata ,getStakeinfo} from "../controllers/user.controllers";

const router = express.Router();
router.get("/getTest",getTest);
router.get("/priceHistoryTest",PriceHistoryTest);



router.get("/tsharedata/:id",TshareUSDprice);
router.get("/HexpriceChartdata/:id",HexpriceChartdata)
router.get("/payoutPerTShare/:id",payoutPerTShare);
router.get("/stakersinfo/:id",Totalstekrs)
router.get("/feedhistory/:id",Feedhistory)
//user
router.get("/getstakedata/:id/:userAddress", getStakedata);
router.get("/getStakeinfo/:id/:userAddress", getStakeinfo);

export default router;
