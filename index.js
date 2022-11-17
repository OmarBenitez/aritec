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



app.get("/",function(req,res){
    res.sendFile(path.join(__dirname, 'web/index.html'));
})

app.use(express.static('public'))

app.listen(port, function () {
    console.log("Started application on port %d", port)
});

app.post('/api/getdata', (req, res) => {

    //q:req.query
    io.emit('newRandom', {rand: Math.random()*1000})

    res.send(200, req.query);

})