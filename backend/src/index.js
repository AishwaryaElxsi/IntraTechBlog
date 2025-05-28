import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import postRoutes from './routes/post.js';
import commentRoutes from './routes/comment.js';
import adminRoutes from './routes/admin.js';
import searchRoutes from './routes/search.js';
import notificationRoutes from './routes/notification.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// DB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => { console.log('MongoDB connected'); })
  .catch((err) => { console.error(err); });

// Middlewares
app.use(morgan('dev'));
app.use(cors({ origin: '*' }));
app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/api/health', (req, res) => res.send('API is running...'));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
