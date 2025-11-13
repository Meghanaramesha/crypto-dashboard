import { updateCryptoData } from "./helpers/fetchData.js";
import pool from "./db.js";

await updateCryptoData();
await pool.end();
console.log("✅ Data fetch completed successfully.");
