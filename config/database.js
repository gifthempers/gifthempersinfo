const mongoose = require('mongoose');

const connectDB = async () => {
  try {
   await mongoose.connect('mongodb+srv://gifthempers:Admin123456@cluster0.gxp7lff.mongodb.net/gifthempersdb?retryWrites=true&w=majority').then(res => {
      console.log(`connected mongodb`)
   }).catch(err => {
    console.error(err.message)
   })
    
    
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

module.exports = connectDB;