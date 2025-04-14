const express = require("express")
const cors = require("cors")
const auctionitem = require("./auctionitems.js")

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json())

app.get("/api/items",(req, res) => {
    return res.status(200).json(auctionitem);
})

app.get("/api/items/:id",(req, res) => {
    const reqId = parseInt(req.params.id);
    const items = auctionitem.auctionItems.find((item) => item.id === reqId);
    if(!items) return res.status(404).json({
        error: "item not found",
    });
    return res.status(201).json(items);
});

app.listen(port,() => {
    console.log("server up and ready")
});