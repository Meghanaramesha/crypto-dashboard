import express from "express";
import axios from "axios";

const router = express.Router();
const USD_TO_INR = 83;

/* ---------------------------------------------------
   EXTRACT COIN NAME (IMPROVED)
--------------------------------------------------- */
function extractCoin(text) {
  const regexList = [
    /price of ([a-z0-9\s-]+)/,
    /value of ([a-z0-9\s-]+)/,
    /rate of ([a-z0-9\s-]+)/,
    /trend of ([a-z0-9\s-]+)/,
    /chart of ([a-z0-9\s-]+)/,
    /graph of ([a-z0-9\s-]+)/,
    /show(?: me)?(?: the)?(?: chart)? of ([a-z0-9\s-]+)/,
    /([a-z0-9\s-]+) trend/,
    /trend for ([a-z0-9\s-]+)/,
    /([a-z0-9\s-]+) 7 days/,
  ];

  for (const r of regexList) {
    const m = text.match(r);
    if (m) return m[1].trim();
  }

  return text.split(" ").pop();
}

/* ---------------------------------------------------
   DETECT DAYS
--------------------------------------------------- */
function extractDays(text) {
  const patterns = [
    /(\d+)\s*day/,
    /(\d+)-day/,
    /(\d+)\s*d/,
    /last\s+(\d+)\s*days/,
    /for\s+(\d+)\s*days/,
    /(\d+)\s*days\s*trend/,
  ];

  for (const p of patterns) {
    const m = text.match(p);
    if (m) return Number(m[1]);
  }

  return null;
}

/* ---------------------------------------------------
   DATE RANGE
--------------------------------------------------- */
function extractDateRange(text) {
  const m = text.match(/between\s+(\d{4}-\d{2}-\d{2})\s+and\s+(\d{4}-\d{2}-\d{2})/);
  return m ? { start: m[1], end: m[2] } : null;
}

/* ---------------------------------------------------
   CoinPaprika Search (improved fuzzy)
--------------------------------------------------- */
async function paprikaSearch(name) {
  try {
    const search = await axios.get(
      `https://api.coinpaprika.com/v1/search?q=${name}&c=currencies`
    );

    if (!search.data.currencies.length) return null;

    const slug = name.toLowerCase();
    const coins = search.data.currencies;

    const coin =
      coins.find((c) => c.name.toLowerCase() === slug) ||
      coins.find((c) => c.symbol.toLowerCase() === slug) ||
      coins.find((c) => c.name.toLowerCase().includes(slug)) ||
      coins[0];

    const ticker = await axios.get(
      `https://api.coinpaprika.com/v1/tickers/${coin.id}`
    );

    return {
      coin_id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      price: (ticker.data.quotes.USD.price * USD_TO_INR).toFixed(2),
    };
  } catch {
    return null;
  }
}

/* ---------------------------------------------------
   CoinGecko fallback
--------------------------------------------------- */
async function geckoSearch(name) {
  try {
    const r = await axios.get("https://api.coingecko.com/api/v3/coins/markets", {
      params: { vs_currency: "inr", ids: name },
    });

    if (!r.data.length) return null;

    const c = r.data[0];
    return {
      coin_id: c.id,
      name: c.name,
      symbol: c.symbol.toUpperCase(),
      price: c.current_price,
    };
  } catch {
    return null;
  }
}

/* ---------------------------------------------------
   CHAT ENDPOINT (UPDATED)
--------------------------------------------------- */
router.get("/", async (req, res) => {
  const text = req.query.text?.toLowerCase().trim() || "";

  if (!text)
    return res.json({
      response: "Try asking: ‘price of Bitcoin’ or ‘7 days trend of Solana’.,Show me the 7-day trend of Ethereum'.",
    });

  // GREETINGS
  if (["hi", "hello", "hey"].includes(text)) {
    return res.json({
      response:
        "Hey Meghana 👋 Ask me things like ‘price of Bitcoin’, ‘7 days trend of XRP’, or ‘Ethereum chart’.",
    });
  }

  // PARSE USER INPUT
  const coinName = extractCoin(text);
  const days = extractDays(text);
  const range = extractDateRange(text);

  let coin =
    (await paprikaSearch(coinName)) ||
    (await geckoSearch(coinName));

  if (!coin)
    return res.json({
      response: `😅 I couldn't find **${coinName}**. Try Bitcoin, Solana, XRP or Dogecoin.`,
    });

  /* -------------------- PRICE -------------------- */
  if (text.includes("price") || text.includes("value") || text.includes("rate")) {
    return res.json({
      response: `💰 The price of **${coin.name} (${coin.symbol})** is **₹${coin.price}**.`,
      coinId: coin.coin_id,
      name: coin.name,
    });
  }

  /* -------------------- TREND / CHART (FIXED) -------------------- */
  if (
    text.includes("trend") ||
    text.includes("chart") ||
    text.includes("graph") ||
    text.includes("show")
  ) {
    // IMPORTANT FIX: if user asked date-range → DON'T apply days
    const useDays = range ? null : (days || 30);

    return res.json({
      response: `📈 Showing trend for **${coin.name} (${coin.symbol})**`,
      coinId: coin.coin_id,
      name: coin.name,
      days: useDays,       // <<< FIXED
      start: range?.start || null,
      end: range?.end || null,
    });
  }

  /* -------------------- SYMBOL -------------------- */
  if (text.includes("symbol")) {
    return res.json({
      response: `🔠 Symbol of **${coin.name}** is **${coin.symbol}**.`,
    });
  }

  /* -------------------- FALLBACK -------------------- */
  return res.json({
    response: `Hmm 😅 Try asking “price of ${coin.name}”.`,
  });
});

export default router;
