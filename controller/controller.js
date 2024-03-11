const db = require('../db.js')

var temperatureData = {
    data: [],
    1: [],
    2: [],
    3: [],
    4: [],
}


var selectedCharts = [];

function getRandomValue(min, max) {
    return ((Math.random() * (max - min)) + min).toFixed(2);
}

setInterval(() => {
        id1 = getRandomValue(17.34, 17.38)
        id2 = getRandomValue(16.12, 16.115);
        id3 = getRandomValue(16.25, 16.3);
        id4 = getRandomValue(16.76, 17.8);
        temperatureData[1].push(id1)
        temperatureData[2].push(id2)
        temperatureData[3].push(id3)
        temperatureData[4].push(id4)
    var obj = {
        1:id1,
        2:id2,
        3:id3,
        4:id4
    }

    var time = (new Date())
    temperatureData.data.push(time)
    
    Object.keys(obj).forEach(async (item) => {
        try {
            await db.query('INSERT INTO AnalogParameters(time, passport_id, value) VALUES($1, $2, $3) RETURNING *', [time, item, obj[item]])
            //console.log(`Insert OK ${time} ${item} ${obj[item]}`)
        } catch (error) {
            console.error(`Error inserting data for id ${item.id}: ${error}`)
        }
    })
    const maxDataPoints = 11;
    Object.keys(temperatureData).forEach(function (ii) {
        
        var arrlen = temperatureData[ii].length
        if (arrlen > maxDataPoints) {
            temperatureData[ii].shift()
        }
    })

}, 10000);

class Controller {
    async getProps(req, res) {
        var user = req.body.user
        try {
            var props = await db.query('SELECT selectedcharts, colors FROM settings WHERE id = $1', [user])
            console.log(props.rows, user)
        } catch (error){
            console.log('Poluchenie', error)
        }
        res.send(props.rows)
    }
    async setProps(req, res) {
        var user = req.body.user
        var selectedcharts = req.body.selectedCharts
        var colors = req.body.colors
        console.log(user, selectedcharts, colors)
        try {
            var jj = await db.query('UPDATE settings SET selectedcharts = $1, colors = $2 WHERE id = $3', [selectedcharts, colors, user])
            
        } catch (error) {
            console.log('HASTROIKI', error)
        }
        console.log('Nastroiki Zameneni')
        res.send({"res":"jopa"})
    }

    async selectedTime(req, res) {
        const selection_scale = req.body.selectionScale
        const selectTime = req.body.selectedTime
        var selectedChartss = req.body.selectedCharts
        var temperatureData2 = {

        }
        console.log(selectTime) 
        try {
            var minparams = await (db.query('SELECT MIN(parameter_id) AS min_parameter_id FROM AnalogParameters WHERE passport_id = $1 AND date_trunc(\'hour\', time) = date_trunc(\'hour\', $2::timestamp)', [selectedChartss[0], selectTime]))
        } catch (error) {
            console.log(error)
        }
        try {
            var params = await db.query('SELECT value, time, passport_id FROM AnalogParameters WHERE parameter_id BETWEEN $1 AND $2 ORDER BY time',
                [(minparams.rows[0].min_parameter_id - selection_scale), (minparams.rows[0].min_parameter_id + selection_scale)],)
                console.log('vsvsdvsdvsv', params.rows)
        } catch (error) {
            console.log(error)
        }
        console.log(selectedChartss)
        selectedChartss.forEach(function (key) {
            console.log(key)
            var bob = params.rows.filter(row => row.passport_id === key);
            console.log(bob)
            temperatureData2[key] = bob
            console.log(temperatureData2)
        })
         
        res.send(temperatureData2)     
}

    async insertValue(req, res) {
        const {time,d1,d2,d3,d4,d5,d6,d7} = req.body

        const newTime = await db.query('Insert INTO cifra (time, d1,d2,d3,d4,d5,d6,d7) values ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *', [time, d1, d2, d3, d4, d5, d6, d7])  
        res.json(newTime.rows[0])
    }
    async getPage(req, res) {
        res.sendFile(__dirname + '/public/index.html');
    }
    async getValues(req, res) {
        
        selectedCharts = req.body.selectedCharts
        //console.log(req.body.selectedCharts)
        var Values = {}
        Values.data = temperatureData.data
        selectedCharts.forEach(function (key) {
            if (temperatureData.hasOwnProperty(key)) {
                Values[key]=temperatureData[key]
            }
        })
        //console.log(Values)
        res.send(Values);
    } 
}
    

module.exports = new Controller()