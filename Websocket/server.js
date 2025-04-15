const express = require("express");
const cors = require("cors");
const http = require("http");
const WebSocket = require("ws");
const auctionItemsFile = require("./auctionItems");

// global bid history storage
const bidHistory = [];

// Initialise Express app
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Create a HTTP Server by using the same express instance
const server = http.createServer(app);

// Create a WebSocket Server and attaching it to the HTTP server
const wss = new WebSocket.Server({ server });

/**
 * ======================== REST API ROUTES ========================
 * These routes demonstrate HTTP request/response communication
 */
app.get("/", (req, res) => {
  res.status(200).send("MLH GHW API Week!");
});

/**
 * GET /api/items - Retrieve all auction items
 */
app.get("/api/items", (req, res) => {
  res.status(200).json(auctionItemsFile.auctionItems);
});

/**
 * GET /api/items/:id - Retrieves a specific auction item by ID
 */
app.get("/api/items/:id", (req, res) => {
  const reqId = parseInt(req.params.id);
  const item = auctionItemsFile.auctionItems.find((item) => item.id === reqId);
  if (!item) {
    return res.status(404).json({
      error: "Item not found",
    });
  }
  res.status(200).json(item);
});

/**
 * POST /api/bids - Place a bid via REST API
 */
app.post("/api/bids", (req, res) => {
  const { itemId, bidAmount, bidder } = req.body;

  if (!itemId || !bidAmount || !bidder) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const foundItem = auctionItemsFile.auctionItems.find(
    (item) => item.id === parseInt(itemId)
  );

  if (!foundItem) {
    return res.status(404).json({ error: "Item not found" });
  }

  if (parseInt(bidAmount) <= foundItem.currentBid) {
    return res
      .status(400)
      .json({ error: "Bid must be higher than current bid" });
  }

  foundItem.currentBid = parseInt(bidAmount); // Update the item with new bid
  const newBid = {
    id: bidHistory.length + 1,
    itemId: parseInt(itemId),
    bidder,
    amount: parseInt(bidAmount),
    timeStamp: new Date().toISOString(),
  };

  foundItem.bids.push(newBid);
  bidHistory.push(newBid);

  res.status(201).json(newBid);
});

/**
 * GET /api/history - Retrieve entire bid history
 */
app.get("/api/history", (req, res) => {
  res.status(200).json(bidHistory);
});

/**
 * ======================== WEBSOCKET HANDLING ========================
 * These routes demonstrate realtime bi-directional communication
 */

// WebSocket connection handler
wss.on("connection", (ws) => {
  console.log("Client connected");

  // Send current auction items to the client when they connect
  ws.send(
    JSON.stringify({
      type: "INITIAL_DATA",
      items: auctionItemsFile.auctionItems,
    })
  );

  // Handle incoming messages from clients
  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message);

      // Handle real-time bid
      if (data.type === "NEW_BID") {
        const { itemId, bidAmount, bidder } = data;

        if (!itemId || !bidAmount || !bidder) {
          ws.send(
            JSON.stringify({
              type: "ERROR",
              message: "Missing required fields",
            })
          );
          return;
        }

        const foundItem = auctionItemsFile.auctionItems.find(
          (item) => item.id === parseInt(itemId)
        );

        if (!foundItem) {
          ws.send(JSON.stringify({ type: "ERROR", message: "Item not found" }));
          return;
        }

        if (parseInt(bidAmount) <= foundItem.currentBid) {
          ws.send(
            JSON.stringify({
              type: "ERROR",
              message: "Bid must be higher than current bid",
            })
          );
          return;
        }

        foundItem.currentBid = parseInt(bidAmount);
        const newBid = {
          id: bidHistory.length + 1,
          itemId: parseInt(itemId),
          bidder,
          amount: parseInt(bidAmount),
          timeStamp: new Date().toISOString(),
        };

        foundItem.bids.push(newBid);
        bidHistory.push(newBid);
        // Broadcast to all connected clients
        broadcastBidUpdate(foundItem, newBid);
      }
    } catch (error) {
      console.error("Error processing message:", error);
      ws.send(
        JSON.stringify({ type: "ERROR", message: "Invalid Message format" })
      );
    }
  });

  // Handle client disconnection
  ws.on("close", () => {
    console.log("Client disconnected", ws);
  });
});

/**
 * Utility function to broadcast updates to all connected clients.
 * This is used to keep all clients in sync
 */
function broadcastBidUpdate(item, bid) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          type: "BID_UPDATE",
          item,
          bid,
        })
      );
    }
  });
}

// Start the server - It listens to HTTP and WebSocket messages on the same port
server.listen(PORT, () => {
  console.log(`Server UP & RUNNING on Port ${PORT}`);
  console.log(`REST API: http://localhost:${PORT}/api/items`);
  console.log(`WebSocket: ws://localhost:${PORT}`);
});