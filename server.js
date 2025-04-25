const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const colors = require("colors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoute");
const errorHandler = require("./middlewares/errorMiddleware");

dotenv.config()

connectDB();

const app = express();

app.use(cors());
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan("dev"))

const port = process.env.PORT || 8080;

app.use('/api/v1/auth', authRoutes)
app.use(errorHandler)

app.listen(port, () => {
    console.log(`server running on ${process.env.DEV_MODE} on ${port }`)
})