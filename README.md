🚀 Crypto Dashboard with Chat Assistant

A full-stack crypto analytics platform that displays live cryptocurrency trends, price charts, and includes an intelligent rule-based Chat Assistant.
Built using React, Node.js, Express, PostgreSQL, and CoinPaprika / CoinGecko APIs.

📌 Features
🔹 Backend

Fetches live data from CoinPaprika / CoinGecko APIs

Stores:

Top 10 cryptocurrencies

30-day historical price data

Built with Node.js + Express

Uses PostgreSQL for persistence

Cron job every 10 minutes to refresh prices

Provides clean REST APIs:

/api/coins – Top 10 coins

/api/coins/:id/history – Historical price data

/api/chat – Rule-based Chat Assistant

Rule-based parsing:

“Price of Bitcoin”

“Show me 7-day trend of Ethereum”

“Graph of Solana”

“Trend between 2024-01-01 and 2024-01-15”

🔹 Frontend (React)

Clean dashboard UI

Top 10 Coins Table

Price

Volume

% change

Sparkline (trend preview)

Interactive Line Chart for selected coin

Chat Assistant Panel

Natural language inputs

Backend-powered responses

Auto-updates chart based on query

Built using Chart.js + React-Chartjs-2

🛠️ Tech Stack
Frontend:

React (Vite)

Axios

Chart.js

React-Chartjs-2

Recharts (for sparkline)

CSS

Backend:

Node.js

Express.js

PostgreSQL

PG library

Axios

Node-cron

dotenv

📂 Project Structure
crypto-dashboard/
│
├── server/
│   ├── index.js
│   ├── db.js
│   ├── routes/
│   │   ├── coins.js
│   │   ├── chat.js
│   │   ├── query.js
│   └── .env
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CoinTable.jsx
│   │   │   ├── ChartView.jsx
│   │   │   ├── ChatAssistant.jsx
│   │   │   ├── Sparkline.jsx
│   │   ├── api/api.js
│   │   ├── styles/
│   │   └── App.jsx
│   ├── public/
│   └── package.json
│
└── README.md

🗄️ Database Schema
Table: coins
coin_id TEXT PRIMARY KEY
name TEXT
symbol TEXT
price NUMERIC
volume NUMERIC
percent_change_24h NUMERIC
updated_at TIMESTAMP

Table: history
id SERIAL PRIMARY KEY
coin_id TEXT REFERENCES coins(coin_id)
price NUMERIC
recorded_date DATE

🛠️ Backend Setup
1️⃣ Install dependencies
cd server
npm install

2️⃣ Create .env
PORT=5000
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=crypto_db

3️⃣ Run backend
npm start

🎨 Frontend Setup
1️⃣ Install dependencies
cd client
npm install

2️⃣ Run React app
npm run dev


App runs at:
👉 http://localhost:5173

Backend runs at:
👉 http://localhost:5000

🤖 Chat Assistant Logic (Rule-Based)

The assistant detects:

✔ Coin Name

Bitcoin

Ethereum

Solana

XRP

Dogecoin

Any coin supported by API

✔ Intent Types:

Price Query

“Price of Bitcoin”

“What is Ethereum value?”

Trend Query

“Show me 7 days trend of Solana”

“Bitcoin chart”

“Graph of XRP”

Date Range Query

“Trend between 2024-01-01 and 2024-01-10”

Symbol Query

“What is symbol of Bitcoin?”

✔ Output

Sends structured response:

{
  response: "...",
  coinId: "...",
  days: 7,
  start: null,
  end: null
}


This updates the frontend chart instantly.

⚠️ Assumptions & Limitations

CoinPaprika sometimes returns fewer historical points

CoinGecko fallback used when a coin is not in Paprika

Caching is implemented but depends on cron refresh

Date-range queries require data available in DB

Sparkline is generated from existing 30-day data

🌍 Deployment

Frontend (React):
✔ Deploy on Vercel / Netlify

Backend (Node):
✔ Deploy on Render / Railway / Cyclic

Database:
✔ Use Neon / Supabase / Render PostgreSQL

💡 Future Improvements

JWT-based user authentication

Save favorite coins

WebSocket for live updates

Better NLP (AI-powered instead of rule-based)