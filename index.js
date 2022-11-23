const express = require("express")
const app = express()
const path = require('path');
const io = require("socket.io")(3001, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const port = 3000;

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://aritec:1q2w3e4r5t@cluster0.3neia.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);

const database = client.db("aritec");

app.get("/",function(req,res){
    res.sendFile(path.join(__dirname, 'web/index.html'));
})

app.use(express.static('public'))

app.listen(port, function () {
    console.log("Started application on port %d", port)
});

app.get('/api/webhook', (req, res) => {

    const {query} = req;
    const coll = database.collection(query.action)
    coll.insertOne(query)

    io.emit(query.action, query);

    res.send(200, 1);

})