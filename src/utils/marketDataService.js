const axios = require('axios');

const getStockData = async (symbol) => {
  const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`;
  try {
    const response = await axios.get(url);
    const data = response.data['Global Quote'];
    if (data && Object.keys(data).length > 0) {
      return {
        symbol: data['01. symbol'],
        price: parseFloat(data['05. price']),
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error fetching Alpha Vantage data for ${symbol}:`, error.message);
    return null;
  }
};

module.exports = { getStockData };