const axios = require('axios');
require('dotenv').config();

async function testApi() {
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`;
  try {
    const response = await axios.post(url, {
      contents: [{ parts: [{ text: "Hello" }] }]
    });
    console.log(JSON.stringify(response.data, null, 2));
  } catch (e) {
    console.error(e.response ? e.response.data : e.message);
  }
}

testApi();
