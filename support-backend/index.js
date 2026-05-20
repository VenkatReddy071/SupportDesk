import "dotenv/config";
import app from "./app.js";
import connectDB from "./configs/ConnectDB.js";

const PORT = process.env.PORT || 5000;

connectDB()
.then(()=>{
    app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    })
})
.catch((error)=>{
    console.log(error)
})
