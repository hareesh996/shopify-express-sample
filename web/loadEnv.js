import dotenv from "dotenv";
import { join } from "path";
if(process.env.NODE_ENV !== "production") {
   dotenv.config({
    path: join(process.cwd(),"..", ".env"),
   });
}