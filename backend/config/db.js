// import mongoose from "mongoose"

// const connectDb = async () => {
//     try {
//         await mongoose.connect(process.env.MONGODB_URL)
//         console.log("Database connected successfully")
//     } catch (error) {
//         console.log("Error connecting to database:", error.message)
//     }
// }

// export default connectDb
import mongoose from "mongoose";

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL, {
            tls: true,
            tlsAllowInvalidCertificates: true,
            serverSelectionTimeoutMS: 5000
        });
        console.log("Database connected successfully");
    } catch (error) {
        console.log("Database connection error:", error);
    }
};

export default connectDb;
