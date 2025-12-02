const express = require("express");
const path = require('path');
const { connectToMongoDB } = require("./connect");
const cookieParser = require('cookie-parser'); 
const {restrictToLoggedinUserOnly} = require("./middlewares/auth"); 
const URL = require("./models/url");

const urlRoute = require("./routes/url");
const staticRouter = require("./routes/staticRouter");
const userRoute = require("./routes/user");

const app = express();
const PORT = 8001;

connectToMongoDB("mongodb://localhost:27017/short-url").then(() =>
  console.log("Mongodb connected")
);

app.set("view engine", "ejs");
app.set('views', path.resolve("./views")); 

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

app.use("/url", urlRoute);
app.use('/', staticRouter);
app.use('/user', restrictToLoggedinUserOnly, userRoute);

app.get('/url/:shortId', async (req, res) => {
  const shortId = req.params.shortId;
  const entry = await URL.findOneAndUpdate(
    {
      shortId,
    },
    {
      $push: {
        visitHistory: {
            Timestamp : Date.now(),
        },
      },
    }
  );
  console.log("query result:", entry);
  res.redirect(entry.redirectURL);
});
// console.log("Query result:", entry);


app.listen(PORT, () => {
  console.log(`server started at PORT: ${PORT}`);
});
