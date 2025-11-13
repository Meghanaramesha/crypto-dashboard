import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import ChartView from "./ChartView";
import "./Dashboard.css";

function Dashboard() {
  const [coins, setCoins] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState("btc-bitcoin");
  const [selectedName, setSelectedName] = useState("Bitcoin");

  // NEW → store days or date-range received from backend
  const [selectedDays, setSelectedDays] = useState(30);
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd] = useState(null);

  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "bot",
      text: "Hey Meghana 👋 I’m Crypta — your crypto buddy! Type a coin name like Bitcoin or ETH to see its trend.",
    },
  ]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const chartRef = useRef(null);
  const topCoinsRef = useRef(null);

  // Load Top Coins
  const fetchCoins = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/coins");
      setCoins(res.data || []);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  useEffect(() => {
    fetchCoins();
  }, []);

  // Refresh Button
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchCoins();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Table Coin Click → Default 30-day chart
  const handleCoinClick = (coin) => {
    setSelectedCoin(coin.coin_id);
    setSelectedName(coin.name);
    setSelectedDays(30);
    setRangeStart(null);
    setRangeEnd(null);

    setTimeout(() => {
      chartRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 200);
  };

  // CHAT SUBMIT
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    setChatMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setChatInput("");

    // Add typing
    setChatMessages((prev) => [...prev, { sender: "bot", text: "__typing__" }]);

    try {
      const res = await axios.get(
        `http://localhost:5000/api/query?text=${encodeURIComponent(userMsg)}`
      );

      const reply = res.data.response;
      const coinId = res.data.coinId;
      const days = res.data.days;
      const start = res.data.start;
      const end = res.data.end;

      // remove typing
      setChatMessages((prev) => prev.slice(0, -1));

      // If a coin is detected → update chart
      if (coinId) {
        setSelectedCoin(coinId);
        setSelectedName(res.data.name || selectedName);

        // Apply days or date-range
        if (days) {
          setSelectedDays(days);
          setRangeStart(null);
          setRangeEnd(null);
        } else if (start && end) {
          setRangeStart(start);
          setRangeEnd(end);
          setSelectedDays(null);
        } else {
          setSelectedDays(30);
        }

        setTimeout(() => {
          chartRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 600);
      }

      // Show bot reply
      setChatMessages((prev) => [...prev, { sender: "bot", text: reply }]);
    } catch (err) {
      console.error(err);
      setChatMessages((prev) => [
        ...prev.slice(0, -1),
        { sender: "bot", text: "Oops 😅 something went wrong! Try again?" },
      ]);
    }
  };

  const scrollToTop = () => {
    topCoinsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="main-container">
      {/* LEFT PANEL */}
      <div className="left-panel">
        <h1 className="main-title">💹 Crypto Dashboard</h1>
        <p className="subtitle">Track top coins and view price trends</p>

        <div className="table-section" ref={topCoinsRef}>
          <div className="table-header">
            <h2>💰 Top 10 Cryptocurrencies</h2>
            <button className="refresh-btn" onClick={handleRefresh}>
              {isRefreshing ? "⏳ Refreshing..." : "🔄 Refresh"}
            </button>
          </div>

          <table className="coins-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Symbol</th>
                <th>Price (₹)</th>
                <th>% Change</th>
              </tr>
            </thead>
            <tbody>
              {coins.map((coin, i) => (
                <tr
                  key={i}
                  onClick={() => handleCoinClick(coin)}
                  className={selectedCoin === coin.coin_id ? "selected-row" : ""}
                >
                  <td>{coin.name}</td>
                  <td>{coin.symbol}</td>
                  <td>{Number(coin.price).toLocaleString()}</td>
                  <td style={{ color: coin.percent_change_24h < 0 ? "red" : "green" }}>
                    {coin.percent_change_24h}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CHART SECTION */}
        <div className="chart-section" ref={chartRef}>
          <h3>📈 {selectedName} Trend</h3>

          <ChartView
            coinId={selectedCoin}
            days={selectedDays}
            start={rangeStart}
            end={rangeEnd}
          />

          <div className="back-to-top">
            <button onClick={scrollToTop}>🔼 Back to Top</button>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL (CHAT) */}
      <div className="right-panel">
        <h2>💬 Crypta — Your Crypto Buddy</h2>

        <div className="chat-box">
          {chatMessages.map((msg, i) => (
            <div key={i} className={`chat-msg ${msg.sender}`}>
              {msg.text === "__typing__" ? (
                <div className="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              ) : (
                msg.text
              )}
            </div>
          ))}
        </div>

        <form className="chat-input" onSubmit={handleChatSubmit}>
          <input
            type="text"
            placeholder="Ask any crypto question..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
}

export default Dashboard;
