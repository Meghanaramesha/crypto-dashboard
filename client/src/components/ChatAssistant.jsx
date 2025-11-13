import React, { useState } from "react";
import "./ChatAssistant.css";

function ChatAssistant({ coins, onCoinSelect }) {
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "bot",
      text: "Hey Meghana 👋 I’m Crypta — your crypto buddy! Type a coin name like Bitcoin or ETH to see its trend.",
    },
  ]);

  const sendBotMessage = (text, delay = 800) => {
    setTimeout(() => {
      setChatMessages((prev) => [...prev, { sender: "bot", text }]);
    }, delay);
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setChatMessages((prev) => [...prev, { sender: "user", text: userMessage }]);

    const lowerMsg = userMessage.toLowerCase();

    // casual greetings
    if (["hi", "hello", "hey", "yo", "sup"].some((w) => lowerMsg.includes(w))) {
      const casualReplies = [
        "Heyyy 👋 what’s up?",
        "Yo! 😄 Ready to talk crypto?",
        "Hey there, Meghana! 👀 Let’s see what’s trending today.",
        "Hii 😎 wanna check Bitcoin or something?",
        "Sup! 🚀 Type any coin name and I’ll pull up its chart.",
      ];
      sendBotMessage(casualReplies[Math.floor(Math.random() * casualReplies.length)]);
      setChatInput("");
      return;
    }

    // coin recognition (even inside sentence)
    const found = coins.find(
      (coin) =>
        lowerMsg.includes(coin.name.toLowerCase()) ||
        lowerMsg.includes(coin.symbol.toLowerCase())
    );

    if (found) {
      const responses = [
        `Ooo nice pick! 🔥 Let’s see how ${found.name} is doing lately...`,
        `Alright, checking ${found.name} 📊 give me a sec...`,
        `${found.name}? Solid choice 😎 Let’s pull up its chart.`,
        `Let’s dive into ${found.name} 💰`,
        `Okay cool — loading ${found.name}'s 30-day trend! 🚀`,
      ];
      sendBotMessage(responses[Math.floor(Math.random() * responses.length)]);
      onCoinSelect(found.coin_id, found.name);
    } else {
      const randomFallbacks = [
        "Hmm 😅 I don’t think that’s a coin I know. Try Bitcoin, ETH or Solana?",
        "Wait what 🤔 that doesn’t sound like a crypto name 😅",
        "Aah nope, never heard of that coin 🙈 Try BTC, ETH or DOGE?",
        "Hehe 😜 maybe check Bitcoin — always a wild ride!",
      ];
      sendBotMessage(randomFallbacks[Math.floor(Math.random() * randomFallbacks.length)]);
    }

    setChatInput("");
  };

  return (
    <div className="chat-container">
      <h2>💬 Crypta — Your Crypto Buddy</h2>
      <div className="chat-box">
        {chatMessages.map((msg, i) => (
          <div
            key={i}
            className={`chat-msg ${msg.sender === "user" ? "user" : "bot"}`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <form className="chat-input" onSubmit={handleChatSubmit}>
        <input
          type="text"
          placeholder="Ask about a coin..."
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default ChatAssistant;
