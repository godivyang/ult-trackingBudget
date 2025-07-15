const express = require("express");
require("dotenv").config();
const userRouter = require("./src/routers/user");
const categoryRouter = require("./src/routers/category");
const entityRouter = require("./src/routers/entity");
const modeRouter = require("./src/routers/mode");
const tagRouter = require("./src/routers/tag");
const transactionRouter = require("./src/routers/transaction");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("./src/db/mongoose");

const app = express();
const port = process.env.PORT || 4001;

const allowedOrigin = process.env.TRACKING_BUDGET_FRONTEND_URL;
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, or Postman)
        console.log(origin);
        if(!origin) return callback(null, true);

        if(allowedOrigin === origin) {
            return callback(null, true);
        } else {
            return callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json());

app.use(cookieParser());

app.use(userRouter);
app.use(categoryRouter);
app.use(entityRouter);
app.use(modeRouter);
app.use(tagRouter);
app.use(transactionRouter);

app.listen(port, () => {
    console.log("Tracking Budget server is up on port", port);
});