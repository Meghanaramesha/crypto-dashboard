// helpers/fetchData.js
import axios from "axios";
import pool from "../db.js";

export async function updateCryptoData() {
  try {
    // 1) Fetch top 10 coins from Paprika
    const top10 = await axios.get("https://api.coinpaprika.com/v1/tickers");

    const coins = top10.data
      .sort((a, b) => b.quotes.USD.market_cap - a.quotes.USD.market_cap)
      .slice(0, 10);

    for (const c of coins) {
      const coin_id = c.id;
      const name = c.name;
      const symbol = c.symbol;
      const price = c.quotes.USD.price * 83;
      const percent_change_24h = c.quotes.USD.percent_change_24h;

      // Save Top 10 coins
      await pool.query(
        `INSERT INTO coins(coin_id, name, symbol, price, percent_change_24h)
         VALUES($1,$2,$3,$4,$5)
         ON CONFLICT (coin_id) DO UPDATE SET
           price=$4,
           percent_change_24h=$5`,
        [coin_id, name, symbol, price, percent_change_24h]
      );

      // 2) Fetch 30-day history
      const historyRes = await axios.get(
        `https://api.coinpaprika.com/v1/tickers/${coin_id}/historical`,
        {
          params: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            interval: "1d",
          },
        }
      );

      const history = historyRes.data;

      // Insert history data
      for (const h of history) {
        await pool.query(
          `INSERT INTO history(coin_id, price, recorded_date)
           VALUES($1, $2, $3)
           ON CONFLICT (coin_id, recorded_date) DO NOTHING`,
          [coin_id, h.price * 83, h.timestamp]
        );
      }
    }

    console.log("✅ Crypto data + history updated");
  } catch (err) {
    console.error("❌ Update failed:", err.message);
  }
}
