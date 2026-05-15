const axios = require('axios');
require('dotenv').config();

async function listModels() {
  const url = `https://generativelanguage.googleapis.com/v1/models?key=${process.env.GEMINI_API_KEY}`;
  try {
    const response = await axios.get(url);
    console.log(JSON.stringify(response.data, null, 2));
  } catch (e) {
    console.error(e.response ? e.response.data : e.message);
  }
}

listModels();
