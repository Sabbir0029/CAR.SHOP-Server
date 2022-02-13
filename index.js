const express = require('express')
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId
require('dotenv').config()
const cors = require('cors');

const app = express()
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dywnj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
  try {
    await client.connect();
    const database = client.db('CAR-SHOP');
    const bmwCarCollection = database.collection('bmwCarList');
    const bookingInfo = database.collection('bookingData');
    const userCollection = database.collection('User');

    // GET
    app.get('/carlist', async (req,res) =>{
      const cursor = bmwCarCollection.find({});
      const list = await cursor.toArray();
      res.send(list);
    })
    app.get('/carlist/:id', async(req,res) =>{
      const id =req.params.id;
      const query = {_id: ObjectId(id)};
      const Places = await bmwCarCollection.findOne(query);
      res.send(Places)
    })
    // get
    app.get('/booking', async (req,res)=>{
      const email = req.query.email;
      const query = {email:email};
      const cursor = bookingInfo.find(query);
      const bookings = await cursor.toArray();
      res.json(bookings);
    })

    app.post('/booking', async (req,res)=>{
      const bookings = req.body;
      const result = await bookingInfo.insertOne(bookings);
      res.json(result);
    })

    app.delete('/booking/:id',async(req,res)=>{
      const id = req.params.id
      const cursor = {_id : ObjectId(id)}
      const result = await bookingInfo.deleteOne(cursor)
      res.json(result)
  })

  app.get('/users/:email', async (req,res)=>{
    const email = req.params.email;
    const query = {email: email};
    const user = await userCollection.findOne(query);
    let isAdmin = false;
    if(user?.role === 'admin'){
      isAdmin = true;
    }
    res.json({admin: isAdmin });
  })

  app.post('/users', async(req,res)=>{
    const user = req.body;
    const result = await userCollection.insertOne(user)
    res.json(result);
  })

  // 
  app.put('/users', async(req,res)=>{
    const user = req.body;
    console.log(user);
    const filter = {email: user.email };
    const options = { upsert: true };
    const updateDoc = { $set: user };
    const result = await userCollection.updateOne(filter, updateDoc, options)
    res.json(result);
  })

  // put
  app.put('/users/admin', async (req,res)=>{
    const user = req.body;
    console.log('Put', user);
    const filter = {email: user.email };
    const updateDoc = { $set: {role:'admin'} };
    const result = await userCollection.updateOne(filter, updateDoc);
    res.json(result);
  })

  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})