# WBTC Scalp Trading Bot - Frontend Dashboard

A React-based dashboard for monitoring and controlling the WBTC Scalp Trading Bot for BSC-based DEXes like PancakeSwap.

![Dashboard Preview](https://via.placeholder.com/800x450.png?text=WBTC+Scalp+Bot+Dashboard)

## Features

- Real-time Bitcoin price monitoring with price chart
- Trading signal indicators (Buy, Sell, Hold, Wait)
- Technical analysis metrics display (RSI, EMA, Price Spread)
- Advanced metrics dashboard with:
  - Multi-timeframe analysis (5m, 15m, 1h)
  - Signal strength indicators
  - Dynamic position sizing recommendations
  - Performance tracking and metrics
- Telegram notification system
- Signal history tracking
- Responsive design for desktop and mobile

## Tech Stack

- React.js
- Tailwind CSS
- Axios for API requests
- React-feather for icons
- WebSocket for real-time updates

## Setup and Installation

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation Steps

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/wbtc-scalp-bot-frontend.git
   cd wbtc-scalp-bot-frontend
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```

4. Update the environment variables in `.env`:
   ```
   REACT_APP_API_URL=http://localhost:5000/api  # URL to your backend API
   REACT_APP_TELEGRAM_BOT_TOKEN=your_bot_token  # Optional for frontend testing
   REACT_APP_TELEGRAM_CHAT_ID=your_chat_id      # Optional for frontend testing
   ```

5. Start the development server:
   ```
   npm start
   # or
   yarn start
   ```

## Building for Production

```
npm run build
# or
yarn build
```

The build artifacts will be stored in the `build/` directory.

## Deployment

This project is configured for easy deployment to Vercel. Simply connect your GitHub repository to Vercel, and it will automatically deploy on every push.

### Manual Deployment to Vercel

```
vercel login
vercel
```

## Connecting to the Backend

This frontend expects a backend API running with the following endpoints:

- `/api/signal` - Current trading signal and metrics
- `/api/signal/history` - Historical signals
- `/api/performance` - Performance metrics
- `/api/multi-timeframe` - Multi-timeframe analysis
- `/api/position-size` - Position sizing recommendations
- `/api/advanced-signal` - Comprehensive signal data
- `/api/send-telegram` - Endpoint for sending Telegram notifications

See the backend repository for setting up the API server.

## Customization

You can customize various aspects of the bot through the interface:

- Update trading parameters
- Toggle auto-trading
- Adjust signal thresholds

## License

[MIT](LICENSE) 