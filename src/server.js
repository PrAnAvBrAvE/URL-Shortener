import express from "express"
import 'dotenv/config';

const app = express();
const port = process.env.PORT

app.get('/health', (req,res) => {
    res.json("ok")
})

app.listen(port, () => {
    console.log(`PORT running on ${port}`);
})