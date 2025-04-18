const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const bodyParser = require('body-parser');

const app = express();

// Middleware to parse JSON data
app.use(bodyParser.json());
app.use(express.json());

// MongoDB URI
const uri = 'mongodb://localhost:27017';
const dbName = 'TuneThreads';
let db;
let ordersCollection;

// Connect to MongoDB
MongoClient.connect(uri)
  .then(client => {
    console.log('Connected to MongoDB');
    db = client.db(dbName);
    ordersCollection = db.collection('orders');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });


// POST: Create an Order
app.post('/orders', async (req, res) => {
    try {
      const newOrder = req.body;
      await ordersCollection.insertOne(newOrder);
      res.status(201).json({ message: 'Order placed successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  

// GET: Get All Orders
app.get('/orders', async (req, res) => {
    try {
      console.log("Fetching all orders...");
      const orders = await ordersCollection.find().toArray();
      console.log("Fetched orders:", orders); // Log the result
      res.status(200).json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error); // Log error for debugging
      res.status(400).json({ error: 'Failed to fetch orders' });
    }
  });
  

// GET/ID: Get Order by ID
app.get('/orders/:id', async (req, res) => {
    const id = req.params.id;
    console.log("Fetching order with ID:", id); // Log the ID

    if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid order ID format' });
    }

    try {
        const order = await ordersCollection.findOne({ _id: new ObjectId(id) });
        if (!order) return res.status(404).json({ error: 'Order not found' });
        console.log("Fetched order:", order); // Log the result
        res.status(200).json(order);
    } catch (error) {
        console.error("Error fetching order:", error); // Log error for debugging
        res.status(400).json({ error: 'Failed to fetch order' });
    }
});

  

// PUT: Update an Order

app.put('/orders/:id', async (req, res) => {
    const id = req.params.id.trim();
  
      await ordersCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: req.body }
      );
  
      // Return the updated order (you can add a 'message' or just confirm the action)
      const updatedOrder = await ordersCollection.findOne({ _id: new ObjectId(id) });
      res.status(200).json(updatedOrder);
  });
  
  
  
    
    

// DELETE: Delete an Order
app.delete('/orders/:id', async (req, res) => {
  try {
    const result = await ordersCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Order not found' });
    res.status(200).json({ message: 'Order deleted' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete order' });
  }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
