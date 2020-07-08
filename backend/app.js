require("dotenv").config();

const express = require("express");
const fs = require('fs');
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const helmet = require("helmet");
const favicon = require("serve-favicon");
const RateLimit = require("express-rate-limit");

const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");
const HttpError = require("./models/http-error");

const app = express();

const limiter = new RateLimit({
  windowMs: 15 * 60 * 1000, // 15minutes
  max: 100, // limit of number of request per IP
  delayMs: 0, // disables delays
});

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');

  next();
});

app.use(helmet()); // helmet setup
app.use(limiter); // Rate limit setup

app.use("/api/places", placesRoutes);
app.use("/api/users", usersRoutes);
// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.png'));

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route.", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, err => {
      console.log(err);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || 'An unknown error occurred!' });
});

mongoose
  .connect(process.env.MONGO_DB_URI, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(5000);
  })
  .catch((err) => {
    throw new Error(err);
  });
