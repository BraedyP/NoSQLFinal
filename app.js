const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(express.json());

const uri = 'mongodb://localhost:27017';
const dbName = 'TuneThreads';

let db;
let ordersCollection;
let customersCollection;
let productsCollection;

// Connect to MongoDB
MongoClient.connect(uri)
  .then(client => {
    console.log('Connected to MongoDB');
    db = client.db(dbName);
    ordersCollection = db.collection('orders');
    customersCollection = db.collection('customers');
    productsCollection = db.collection('products');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

/* ---------------------------------- ORDERS ---------------------------------- */

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
    const orders = await ordersCollection.find().toArray();
    res.status(200).json(orders);
  } catch (err) {
    res.status(400).json({ error: 'Failed to fetch orders' });
  }
});

// GET/ID: Get Order by ID
app.get('/orders/:id', async (req, res) => {
  const id = req.params.id;
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid ID format' });

  try {
    const order = await ordersCollection.findOne({ _id: new ObjectId(id) });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.status(200).json(order);
  } catch (err) {
    res.status(400).json({ error: 'Failed to fetch order' });
  }
});

// PUT: Update an Order
app.put('/orders/:id', async (req, res) => {
  const id = req.params.id.trim();
  try {
    await ordersCollection.updateOne({ _id: new ObjectId(id) }, { $set: req.body });
    const updatedOrder = await ordersCollection.findOne({ _id: new ObjectId(id) });
    res.status(200).json(updatedOrder);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update order' });
  }
});

// DELETE: Delete an Order
app.delete('/orders/:id', async (req, res) => {
  try {
    const result = await ordersCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Order not found' });
    res.status(200).json({ message: 'Order deleted' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete order' });
  }
});

/* -------------------------------- CUSTOMERS --------------------------------- */

// POST: Create Customer
app.post('/customers', async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });
    const result = await customersCollection.insertOne({ name, email });
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: All Customers
app.get('/customers', async (req, res) => {
  try {
    const customers = await customersCollection.find().toArray();
    res.status(200).json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET by ID
app.get('/customers/:id', async (req, res) => {
  const id = req.params.id;
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid ID format' });

  try {
    const customer = await customersCollection.findOne({ _id: new ObjectId(id) });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.status(200).json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT: Update Customer
app.put('/customers/:id', async (req, res) => {
  const id = req.params.id;
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid ID format' });

  try {
    await customersCollection.updateOne({ _id: new ObjectId(id) }, { $set: req.body });
    const updated = await customersCollection.findOne({ _id: new ObjectId(id) });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE: Remove Customer
app.delete('/customers/:id', async (req, res) => {
  const id = req.params.id;
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid ID format' });

  try {
    const result = await customersCollection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Customer not found' });
    res.status(200).json({ message: 'Customer deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* --------------------------------- PRODUCTS --------------------------------- */

// POST: Add Product
app.post('/products', async (req, res) => {
  try {
    const { name, price, category, inStock } = req.body;
    if (!name || price == null || !category || inStock == null) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const result = await productsCollection.insertOne({ name, price, category, inStock });
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: All Products
app.get('/products', async (req, res) => {
  try {
    const products = await productsCollection.find().toArray();
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET by ID
app.get('/products/:id', async (req, res) => {
  const id = req.params.id;
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid ID format' });

  try {
    const product = await productsCollection.findOne({ _id: new ObjectId(id) });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT: Update Product
app.put('/products/:id', async (req, res) => {
  const id = req.params.id;
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid ID format' });

  try {
    await productsCollection.updateOne({ _id: new ObjectId(id) }, { $set: req.body });
    const updated = await productsCollection.findOne({ _id: new ObjectId(id) });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE: Remove Product
app.delete('/products/:id', async (req, res) => {
  const id = req.params.id;
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid ID format' });

  try {
    const result = await productsCollection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Product not found' });
    res.status(200).json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ------------------------------ START SERVER ------------------------------ */

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
