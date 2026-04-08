const express = require('express');
const os = require('os');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017';
const DB_NAME = process.env.DB_NAME || 'lab6db';
const COLLECTION_NAME = process.env.COLLECTION_NAME || 'tasks';

let collection;

async function connectWithRetry(retries = 10, delay = 3000) {
  for (let i = 1; i <= retries; i++) {
    try {
      const client = new MongoClient(MONGO_URI);
      await client.connect();

      const db = client.db(DB_NAME);
      collection = db.collection(COLLECTION_NAME);

      console.log('Connected to MongoDB successfully');
      return;
    } catch (error) {
      console.log(`MongoDB connection attempt ${i} failed: ${error.message}`);
      if (i < retries) {
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}

app.get('/', (req, res) => {
  res.json({
    app: 'CISC 886 Lab 8',
    mode: process.env.MODE || 'local',
    node: process.version,
    host: os.hostname(),
  });
});

app.get('/tasks', async (req, res) => {
  try {
    const tasks = await collection.find({}, { projection: { _id: 0 } }).toArray();

    const grouped = tasks.reduce((acc, task) => {
      if (!acc[task.status]) acc[task.status] = [];
      acc[task.status].push(task);
      return acc;
    }, {});

    res.json(grouped);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch tasks from database',
      details: error.message
    });
  }
});

async function startServer() {
  try {
    await connectWithRetry();

    app.listen(PORT, () => {
      console.log('--------------------------------------------------');
      console.log(`  CISC 886 Lab 8 — App started`);
      console.log(`  Port:  ${PORT}`);
      console.log(`  Mode:  ${process.env.MODE || 'docker'}`);
      console.log(`  Node:  ${process.version}`);
      console.log(`  Host:  ${os.hostname()}`);
      console.log(`  Mongo: ${MONGO_URI}`);
      console.log(`  DB:    ${DB_NAME}`);
      console.log('--------------------------------------------------');
    });
  } catch (error) {
    console.error('Failed to start app:', error.message);
    process.exit(1);
  }
}

startServer();
