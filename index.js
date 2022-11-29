const express = require("express")
const app = express()
const path = require('path');
const ExcelJS = require('exceljs');

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

app.get('/api/getCaudalKPIs', (req, res) => {

    var coll = database.collection('caudal');
    coll.find({ }).sort({timestamp: -1}).limit(10).toArray(function (e, d) {

        if(e) {
            res.send(500,e);
        } else {
            res.send(200,d);
        }

    })
})

app.get('/api/webhook', (req, res) => {

    const {query} = req;

    if(query.action === 'caudal') {
        const coll = database.collection(query.action);
        const d = new Date();
        coll.find({ year: d.getFullYear(), month: d.getMonth()+1, day:d.getDate()}).toArray((e,d) => {

            if(d.length === 0) {
                coll.insertOne({...query, timestamp: new Date(), year: new Date().getFullYear(), month: new Date().getMonth()+1, day: new Date().getDate()})
            }

        })

        io.emit(query.action, {...query, timestamp: new Date()});
        res.send(200, 1);
    }

    const coll = database.collection(query.action)
    if(query.save) {
        coll.insertOne({...query, timestamp: new Date(), year: new Date().getFullYear(), month: new Date().getMonth()+1, day: new Date().getDate()})
    }
    io.emit(query.action, {...query, timestamp: new Date(), year: new Date().getFullYear(), month: new Date().getMonth()+1, day: new Date().getDate()});

    res.send(200, 1);

})

app.get('/reports/getCaudalReport', (req, res) => {

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Shay';
    workbook.lastModifiedBy = 'Shay';
    workbook.created = new Date();
    workbook.modified = new Date();

    const sheet = workbook.addWorksheet('Reporte');

    sheet.getCell('A1').value = "ARITECT Reporte de Caudal";

    sheet.getCell('A3').value = "Fecha";
    sheet.getCell('B3').value = "Promedio de Caudal";

    var coll = database.collection('caudal');
    coll.find({ }).sort({timestamp: -1}).limit(10).toArray(function (e, d) {
        if(e) {
            res.send(500,e);
        } else {

            var r=4;
            for(var _ of d) {
                sheet.getCell('A'+r).value = new Date(_.timestamp);
                sheet.getCell('B'+r).value = Number(_.QT);

                r++;
            }

            res.set({
                'Content-Disposition': 'attachment; filename="ARITEC - Report Caudal '+(new Date().toLocaleDateString())+'.xlsx',
                'Content-Type': "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            workbook.xlsx.write(res)
        }
    });

;

})