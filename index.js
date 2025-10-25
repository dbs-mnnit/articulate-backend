import express from 'express';
const app = express();
import dotenv from 'dotenv';
dotenv.config();
import connectDB from './src/configs/db.js';
import authRoutes from './src/modules/auth/authRoutes.js';
import thoughtsRoutes from './src/modules/thoughts/thoughtsRoutes.js';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import cors from 'cors';

const PORT = process.env.ARTICULATE_PORT || 3000;


const allowedOrigins = [
  "https://articulate-9lprwve66-digvijay-bahadur-singhs-projects.vercel.app",
  "http://localhost:5173", // optional, for local dev
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("❌ Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true, // if you use cookies / Authorization headers
  })
);




// Connect to the database
connectDB();

console.log('NODE ENV', process.env.NODE_ENV);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/thoughts', thoughtsRoutes);

// Health Check Endpoint
app.get('/api/v1/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({ status: 'OK', message: 'Server is healthy', database: dbStatus });
});

app.use((err, req, res, next) => {
  // console.log(err)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

app.listen(PORT, () => {
  console.log(`Articulate Server is running on http://localhost:${PORT} in ${process.env.NODE_ENV} mode`);
});