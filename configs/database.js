const mongoose = require('mongoose');

const connect = async () => {
  try {
    await mongoose.connect(process.env.DATABASE);
    console.log('DB connection successfully !');
  } catch (error) {
    console.log('DB connection failed !');
    console.log(error);
  }
};
module.exports = { connect };
