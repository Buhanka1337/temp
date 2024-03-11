const Router = require('express')
const router = new Router()
const controller = require('../controller/controller')

router.post('/put', controller.insertValue)
router.get('/', controller.getPage)
router.post('/temperature', controller.getValues)
router.post('/submitTime', controller.selectedTime)
router.post('/getProps', controller.getProps)
router.post('/setProps', controller.setProps)
router.post('/submitTimee', (req, res) => {
    const selectedTime = req.body;
    console.log(req.body)
    res.send(`Выбранное время: ${selectedTime}`);
});
module.exports = router