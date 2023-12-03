import express from "express";
import { getTest,TshareUSDprice,HexpriceChartdata,payoutPerTShare,Totalstekrs } from "../controllers/global.controllers";
import { getStakedata ,getStakeinfo} from "../controllers/user.controllers";

const router = express.Router();
router.get("/getTest",getTest);

router.get("/tsharedata/:id",TshareUSDprice);
router.get("/HexpriceChartdata/:id",HexpriceChartdata)
router.get("/payoutPerTShare/:id",payoutPerTShare);
router.get("/stakersinfo/:id",Totalstekrs)

//user
router.get("/getstakedata/:id/:userAddress", getStakedata);
router.get("/getStakeinfo/:id/:userAddress", getStakeinfo);

export default router;
