import express from "express";
import { getTest,TshareUSDprice,HexpriceChartdata } from "../controllers/global.controllers";
import { getStakedata } from "../controllers/user.controllers";

const router = express.Router();
router.get("/getTest",getTest);

router.get("/tsharedata",TshareUSDprice);
router.get("/HexpriceChartdata",HexpriceChartdata)
router.get("/getstakedata",getStakedata)

export default router;
