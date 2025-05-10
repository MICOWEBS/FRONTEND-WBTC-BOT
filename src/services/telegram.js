import axios from 'axios';
import { formatPrice, formatPercent } from '../utils/formatters';

const BOT_TOKEN = process.env.REACT_APP_TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.REACT_APP_TELEGRAM_CHAT_ID;

/**
 * Sends a notification to Telegram
 * @param {Object} signalData - The trading signal data
 * @returns {Promise} - The response from the Telegram API
 */
export const sendTelegramNotification = async (signalData) => {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.warn('Telegram Bot Token or Chat ID is not set');
    return null;
  }
  
  try {
    // Extract basic signal data
    const { 
      signal, 
      binancePrice, 
      dexPrice, 
      rsi, 
      ema, 
      spread, 
      timestamp 
    } = signalData;
    
    // Extract advanced metrics if available
    const signalStrength = signalData.signal_strength || 0;
    const confidenceScore = signalData.confidence_score || 0;
    const volatility = signalData.volatility || 0;
    const positionSize = signalData.position_size || 0;
    const autoTrading = signalData.auto_trading || false;
    
    // Get emoji and direction indicators
    const getSignalEmoji = (signalType) => {
      switch (signalType?.toUpperCase()) {
        case 'BUY': return '🟢 💰 BUY SIGNAL';
        case 'SELL': return '🔴 💸 SELL SIGNAL';
        case 'HOLD': return '🟡 🔒 HOLD SIGNAL';
        default: return '⚪ ⏳ WAITING';
      }
    };

    const getPriceAction = (s) => {
      if (s > 0) return `📈 +${s.toFixed(2)}%`;
      if (s < 0) return `📉 ${s.toFixed(2)}%`;
      return `➖ ${s.toFixed(2)}%`;
    };

    const getRsiStatus = (rsiValue) => {
      if (rsiValue <= 30) return '🟢 Oversold';
      if (rsiValue >= 70) return '🔴 Overbought';
      return '⚪ Neutral';
    };
    
    // Format message with rich formatting and emojis
    const messageText = `
*📊 WBTC SCALP BOT ALERT 📊*
${getSignalEmoji(signal)}

⚡ *Market Conditions*:
• RSI: \`${rsi.toFixed(1)}\` ${getRsiStatus(rsi)}
• EMA: \`${formatPrice(ema)}\`
• Binance BTC: \`${formatPrice(binancePrice)}\`
• DEX WBTC: \`${formatPrice(dexPrice)}\`
• Spread: ${getPriceAction(spread)}
${spread > 0 ? '💹 DEX price higher than Binance' : '📉 DEX price lower than Binance'}

${signalStrength > 0 ? `⚖️ *Signal Analysis*:
• Signal Strength: \`${signalStrength.toFixed(1)}%\`
• Confidence Score: \`${confidenceScore.toFixed(1)}%\`
• Volatility: \`${volatility.toFixed(2)}%\`
${positionSize > 0 ? `• Position Size: \`${formatPrice(positionSize)}\`` : ''}
` : ''}

⏰ Signal Time: \`${new Date(timestamp).toLocaleString()}\`
🤖 Trading Mode: ${autoTrading ? '*AUTO TRADING ENABLED*' : 'Signal Only'}

${signal === 'BUY' ? 
'✅ *ACTION: BUY WBTC on DEX*\nEntry opportunity detected!' : 
signal === 'SELL' ? 
'🛑 *ACTION: SELL WBTC on DEX*\nExit opportunity detected!' : 
'📢 *ACTION: MONITOR MARKET*\nWaiting for better conditions...'}
`.trim();
    
    // Send message via Telegram Bot API
    const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const response = await axios.post(telegramUrl, {
      chat_id: CHAT_ID,
      text: messageText,
      parse_mode: 'Markdown',
    });
    
    return response.data;
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    return null;
  }
};

export default {
  sendTelegramNotification,
}; 