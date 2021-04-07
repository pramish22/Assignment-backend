const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()
const port = 5000

app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)

app.use(cors())

const db = require('./queries')

app.get('/', (request, response) => {
    response.json({ info: 'Node.js, Express, and Postgres API' })
})
app.get('/names', db.getStockNames)
app.post('/transactions', db.transactStock)
app.get('/transactions', db.getTransactions)
app.get('/dashboard', db.getDashboard)
app.get('/dashboardtotal', db.getTotalDashboard)

app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})

