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
    coll.find({ }).sort({timestamp: -1}).limit(20).toArray(function (e, d) {

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
    coll.find({ }).sort({timestamp: -1}).toArray(function (e, d) {
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

app.get('/api/seedCaudalData', (req, res) => {
    const coll = database.collection('caudal');

    const data = [
        {QT:15.3900139940599,timestamp: new Date('2022-11-02')},
        {QT:0,timestamp: new Date('2022-11-03')},
        {QT:15.0017006772922,timestamp: new Date('2022-11-04')},
        {QT:0,timestamp: new Date('2022-11-05')},
        {QT:14.9281564264905,timestamp: new Date('2022-11-06')},
        {QT:0,timestamp: new Date('2022-11-07')},
        {QT:15.3380481722229,timestamp: new Date('2022-11-08')},
        {QT:0,timestamp: new Date('2022-11-09')},
        {QT:14.2734669074149,timestamp: new Date('2022-11-10')},
        {QT:0,timestamp: new Date('2022-11-11')},
        {QT:15.4272683880192,timestamp: new Date('2022-11-12')},
        {QT:0,timestamp: new Date('2022-11-13')},
        {QT:14.1643710843173,timestamp: new Date('2022-11-14')},
        {QT:0,timestamp: new Date('2022-11-15')},
        {QT:14.8163842593365,timestamp: new Date('2022-11-16')},
        {QT:0,timestamp: new Date('2022-11-17')},
        {QT:15.33483216836,timestamp: new Date('2022-11-18')},
        {QT:0,timestamp: new Date('2022-11-19')},
        {QT:15.0260662342507,timestamp: new Date('2022-11-20')},
        {QT:0,timestamp: new Date('2022-11-21')},
        {QT:15.0910920851111,timestamp: new Date('2022-11-22')},
        {QT:0,timestamp: new Date('2022-11-23')},
        {QT:9.73375484488466,timestamp: new Date('2022-11-24')},
        {QT:0,timestamp: new Date('2022-11-25')},
        {QT:10.9702172616423,timestamp: new Date('2022-11-26')},
        {QT:0,timestamp: new Date('2022-11-27')},
        {QT:9.65339270592293,timestamp: new Date('2022-11-28')},
        {QT:0,timestamp: new Date('2022-11-29')},
        {QT:10.0492624653479,timestamp: new Date('2022-11-30')},
        {QT:0,timestamp: new Date('2022-11-31')},
        {QT:10.0005441442769,timestamp: new Date('2022-11-32')},
    ];

    for(var d of data) {
        coll.insertOne({...d, year: d.timestamp.getFullYear(), month: d.timestamp.getMonth()+1, day: d.timestamp.getDate()})
    }

    res.send(200,data);

})