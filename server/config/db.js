const mongoose = require("mongoose")
const colors = require("colors")

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log(`Connected to MonogDB database ${mongoose.connection.host}`)
    } catch (error) {
        console.error(`MonogDB database error: ${error }`)
    }
}

module.exports = connectDB