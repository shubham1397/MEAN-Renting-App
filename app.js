const path = require("path");
const express = require("express");
const db = require("./db/db");
const header_middleware = require("./middlewares/header");

const itemRouter = require("./Routes/item");
const userRoutes = require("./Routes/user");
const profileRoutes = require("./Routes/profile");

var cors = require("cors");

const app = express();
app.use(cors({ origin: "*" }));
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(header_middleware);
const directory = path.join(__dirname, "./images");
app.use("/images", express.static(directory));
app.use("/api/items", itemRouter);
app.use("/api/user", userRoutes);
app.use("/api/profile", profileRoutes);
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.listen(PORT, (req, res) => {
  console.log(`app is listening to PORT ${PORT}`);
});
