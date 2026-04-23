const mongoose = require('mongoose');
const URL = require('./models/url');
const User = require('./models/user');

async function check() {
  await mongoose.connect('mongodb://localhost:27017/short-url');
  const urls = await URL.find({});
  console.log('Total URLs:', urls.length);
  const latest = await URL.find({}).sort({createdAt: -1}).limit(2);
  console.log('Latest:', latest.map(u => u.redirectURL));
  process.exit(0);
}
check();
