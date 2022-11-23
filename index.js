const express = require("express")
const app = express()
const path = require('path');
const io = require("socket.io")(3001, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const port = 443;



app.get("/",function(req,res){
    res.sendFile(path.join(__dirname, 'web/index.html'));
})

app.use(express.static('public'))

app.listen(port, function () {
    console.log("Started application on port %d", port)
});

app.get('/api/webhook', (req, res) => {

    // const socket = new io.Socket();
    const {query} = req;
    //q:req.query
    switch (query.action) {
        case 'humedad': {
            //TODO: guardar en la db

            io.emit('humedad', query);
            //mandar evento
            break;
        }
    }

    res.send(200, 1);

})