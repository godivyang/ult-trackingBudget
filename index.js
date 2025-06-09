const express = require("express");
const categoryRouter = require("./src/routers/category");
const entityRouter = require("./src/routers/entity");
const modeRouter = require("./src/routers/mode");
const tagRouter = require("./src/routers/tag");
const transactionRouter = require("./src/routers/transaction");
require("./src/db/mongoose");

const app = express();
const port = process.env.PORT || 3002;
app.use(express.json());

app.use(categoryRouter);
app.use(entityRouter);
app.use(modeRouter);
app.use(tagRouter);
app.use(transactionRouter);

app.listen(port, () => {
    console.log("Tracking Budget server is up on port", port);
});