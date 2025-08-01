/*jshint esversion: 8 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pinoLogger = require('./logger');

const connectToDatabase = require('./models/db');
const {loadData} = require("./util/import-mongo/index");


const app = express();

app.use(cors({
  origin: "*", // For production, replace with specific origin like "https://your-frontend-url"
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true // If you're using cookies or auth headers
}));

const port = 3060;

// Connect to MongoDB; we just do this one time
connectToDatabase().then(() => {
    pinoLogger.info('Connected to DB');
})
    .catch((e) => console.error('Failed to connect to DB', e));


app.use(express.json());

// Route files
// Gift API Task 1: import the giftRoutes and store in a constant called giftroutes
//{{insert code here}}
const giftRoutes = require('./routes/giftRoutes');
const authRoutes = require('./routes/authRoutes');


// Search API Task 1: import the searchRoutes and store in a constant called searchRoutes
//{{insert code here}}
const searchRoutes = require('./routes/searchRoutes');


const pinoHttp = require('pino-http');
const logger = require('./logger');

app.use(pinoHttp({ logger }));

// Use Routes
// Gift API Task 2: add the giftRoutes to the server by using the app.use() method.
//{{insert code here}}
app.use('/api/gifts', giftRoutes);


// Search API Task 2: add the searchRoutes to the server by using the app.use() method.
//{{insert code here}}
app.use('/api/search', searchRoutes);app.use('/api/search', searchRoutes);

app.use('/api/auth', authRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Internal Server Error');
});

app.get("/",(req,res)=>{
    res.send("Inside the server");
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
