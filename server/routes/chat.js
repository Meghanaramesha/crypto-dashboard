import express from "express";
import pool from "../db.js";
const router = express.Router();

router.post("/", async (req, res) => {
  const { message } = req.body;
  const lower = message.toLowerCase().trim();
  let reply = "";

  try {
    // 🗣️ Casual greetings
    if (["hi", "hello", "hey", "hii", "hola"].some((greet) => lower.includes(greet))) {
      reply = "Hey there 👋! I’m Crypta — your crypto buddy. How’s your day going?";
    }
    // 🤖 Small talk
    else if (lower.includes("how are you")) {
      reply = "I’m running on pure blockchain energy ⚡ — feeling great!";
    }
    else if (lower.includes("who are you")) {
      reply = "I’m Crypta 😎, your personal guide in the crypto world. Ask me about coins, trends, or blockchain!";
    }
    // 💰 Crypto price lookup
    else if (lower.includes("price of")) {
      const coin = lower.split("price of ")[1]?.trim();
      if (coin) {
        const result = await pool.query(
          "SELECT price FROM coins WHERE LOWER(name)=$1 OR LOWER(symbol)=$1",
          [coin]
        );
        if (result.rows.length > 0) {
          reply = `The current price of ${coin} is ₹${result.rows[0].price.toLocaleString()}. 💰`;
        } else {
          reply = `Hmm 🤔 I couldn’t find ${coin} in my database. Try Bitcoin, Ethereum, or Solana.`;
        }
      } else {
        reply = "Could you specify which coin? Like 'price of Bitcoin' 💡";
      }
    }
    // 📘 Definition
    else if (lower.startsWith("what is")) {
      const coin = lower.split("what is ")[1]?.trim();
      if (coin) {
        reply = `${coin.charAt(0).toUpperCase() + coin.slice(1)} is one of the trending cryptocurrencies, built on blockchain technology 🚀.`;
      } else {
        reply = "You can ask something like 'What is Ethereum?' 😊";
      }
    }
    // 👋 Default
    else {
      reply = "Sorry 😅, I didn’t get that. Try asking about Bitcoin, Ethereum, or say hi to me!";
    }

    // Save chat history
    await pool.query("INSERT INTO chat_history (sender, message_text) VALUES ($1, $2)", ["user", message]);
    await pool.query("INSERT INTO chat_history (sender, message_text) VALUES ($1, $2)", ["bot", reply]);

    res.json({ reply });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ reply: "Oops 😅 something went wrong. Try again later!" });
  }
});

export default router;
