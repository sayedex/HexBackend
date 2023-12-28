import express, { Application, Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import Session from "express-session";
import cors from "cors";

import globalschema from "./Models/GlobalInfo"

import { UpdateTsharechart } from "./query/UpdateTshare";

//regin payment

import Router from "./routes/info.route"

const app = express();
dotenv.config();
const connect = async () => {
  try {
    const db = await mongoose.connect(process.env.MONGO!);
    return {isdone:true}
  } catch (error) {
    console.log(error);
    return {isdone:false}
  }
};

var whitelist = [
  "http://localhost:3000",
  "https://cipherem.xyz",
  "http://localhost:5000/api",
  "https://hex-crypto.vercel.app",
  "https://beta.hexcrypto.com"
];

var corsOptions = {
  origin: function (origin: any, callback: any) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // enable CORS with credentials
};

app.use(express.json());
app.use(cookieParser());
app.use("/api/global",cors(corsOptions), Router)
app.use("/api/public", Router)

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const errorStatus = err.status || 500;
  const errorMessage = err.message || "Something went wrong!";
  return res.status(errorStatus).send(errorMessage);
});

app.listen(5000, async () => {
  connect().then((e)=>{
    if(e.isdone){
      console.log("connet to db");
     UpdateTsharechart();
    }

 })
  console.log("Backend server is running!");
});
