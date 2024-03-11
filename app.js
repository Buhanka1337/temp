const express = require('express');
const app = express();
const port = 3000;
const sensorRouter = require('./router/router')
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use('/api', sensorRouter)




app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});