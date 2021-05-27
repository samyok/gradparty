const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const JSONdb = require('simple-json-db');
const {nanoid} = require('nanoid')
const dayjs = require('dayjs');
const db = new JSONdb('./database.json');
const app = express();
const PORT = 9578;
app.listen(PORT, () => console.log(`listening to port ${PORT}`));

app.use(express.static(path.join(__dirname, '..', 'build')));

app.use(bodyParser.json())

app.get('/data', (req, res) => {
    let data = db.JSON();
    let keys = Object.keys(data);
    let days = {};
    keys.forEach(key => {
        let party = data[key];
        let unixStartTime = +dayjs(party.day + " " + party.startTime);
        let timeString = dayjs(party.day + " " + party.startTime).format("h:mm A") + " - " + dayjs(party.day + " " + party.endTime).format("h:mm A")
        let dayName = dayjs(party.day).format("dddd, MMMM DD");
        if (!days[dayName]) days[dayName] = [];
        days[dayName].push({...party, unixStartTime, timeString})
    });
    console.log(days);
    let result = Object.keys(days).sort((a, b) => +dayjs(a) < +dayjs(b) ? -1 : 1).map(key => ({
        name: key,
        listings: days[key].sort((a, b) => a.unixStartTime > b.unixStartTime ? 1 : -1)
    }));
    res.json(result);
});

app.post('/submit', (req, res) => {
    let fieldNames = [
        "name",
        "day",
        "startTime",
        "endTime",
        "address",
        "phoneNumber",
    ]
    for (let i = 0; i < fieldNames.length; i++) {
        let name = fieldNames[i];
        if (!req.body[name]) return res.json({success: false, error: `Please fill in the required ${name} field`})
    }
    console.log(req.body);
    db.set(nanoid(10), {...req.body, ip: req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress});
    res.json({success: true});

})
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', '/build/index.html'));
})