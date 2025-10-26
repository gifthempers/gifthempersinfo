const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();
const connectDB = require('./config/database')

const registrationRoutes = require('./routes/registrationRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT =  3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, './frontend')));

app.get('/', (req, res) => {
  return res.sendFile(path.join(__dirname, './frontend/index.html'));
});


// MongoDB Connection
// const MONGODB_URI = 'mongodb+srv://gifthempers:Admin@123456@cluster0.gxp7lff.mongodb.net/gifthempersdb?retryWrites=true&w=majority';

//  mongoose.connect(MONGODB_URI)
// .then(() => console.log('MongoDB connected successfully'))
// .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/registration', registrationRoutes);
app.use('/api/admin', adminRoutes);

// // Serve HTML pages

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/admin.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong!' });
});

app.listen(PORT, async () => {
  await connectDB()
  console.log(`Server is running on port ${PORT}`);
});