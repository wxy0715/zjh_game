const mongoose = require("mongoose");

mongoose.connect('mongodb://admin:wxy0715..@8.142.156.127:27017/zjh?authSource=admin');


const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("db is connected...");
});
