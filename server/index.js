require('dotenv').config({ path: __dirname + '/.env' });

const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const bookmarkRoutes = require('./bookmarkRoutes');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Bookmark API Routes
app.use('/api/bookmarks', bookmarkRoutes);

// News API Route
app.get('/top-headlines', async (req, res) => {
  const category = req.query.category || 'technology';

  try {
    const response = await axios.get(
      `https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${process.env.NEWS_API_KEY}`     

    );
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching news:', error.message);
    res.status(500).json({ message: 'Error fetching news', error: error.message });
  }
});

// Server Listening
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log('Loaded API Key:', process.env.NEWS_API_KEY);

});
