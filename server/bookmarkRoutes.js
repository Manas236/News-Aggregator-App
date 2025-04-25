require('dotenv').config();

const express = require('express');
const { MongoClient } = require('mongodb');

const router = express.Router();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
let db;

async function connectDB() {
  if (!db) {
    await client.connect();
    db = client.db('bookmarkDB');
    console.log('✅ Connected to MongoDB');
  }
  return db;
}

// Add bookmark (now includes thumbnail)
router.post('/add', async (req, res) => {
  const { title, link, thumbnail } = req.body;
  if (!title || !link) return res.status(400).json({ error: 'Missing title or link' });

  try {
    const db = await connectDB();
    const result = await db.collection('bookmarks').insertOne({
      title,
      link,
      thumbnail: thumbnail || 'https://via.placeholder.com/300x200',
      createdAt: new Date(),
    });
    res.status(200).json({ message: 'Bookmark added', id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: 'DB error', details: err.message });
  }
});

// Get all bookmarks
router.get('/all', async (req, res) => {
  try {
    const db = await connectDB();
    const bookmarks = await db.collection('bookmarks').find().toArray();
    res.status(200).json(bookmarks);
  } catch (err) {
    res.status(500).json({ error: 'DB error', details: err.message });
  }
});

// Delete bookmark by link
router.delete('/delete', async (req, res) => {
  const { link } = req.body;
  if (!link) return res.status(400).json({ error: 'Missing link' });

  try {
    const db = await connectDB();
    const result = await db.collection('bookmarks').deleteOne({ link });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }
    res.status(200).json({ message: 'Bookmark deleted' });
  } catch (err) {
    res.status(500).json({ error: 'DB error', details: err.message });
  }
});

module.exports = router;
