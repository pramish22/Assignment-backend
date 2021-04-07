
const Pool = require('pg').Pool
//postgres://ynlxesnb:QjOBzmwskgxcGfV0LhZ91LMiDwnv2JvX@queenie.db.elephantsql.com:5432/ynlxesnb
const pool = new Pool({
    user: 'ynlxesnb',
    host: 'queenie.db.elephantsql.com',
    database: 'ynlxesnb',
    password: 'QjOBzmwskgxcGfV0LhZ91LMiDwnv2JvX',
    port: 5432,
})

const getStockNames = (request, response) => {
    pool.query('SELECT * FROM stock_app.stock_names ORDER BY company_symbol', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}
const transactStock = (request, response) => {
    const { company_symbol, quantity, unit_price, transaction_type, transaction_date } = request.body
    console.log("Quantity: " + quantity + "Amount: " + unit_price);
    const amount  = quantity * unit_price;
    console.log("Amount: " + amount);
    //validate transaction_type
    pool.query('INSERT INTO stock_app.stock_transaction (company_symbol, transaction_type, quantity, amount, transaction_date) VALUES ($1, $2,$3,$4,$5)', [company_symbol, transaction_type,quantity,amount,transaction_date], (error, results) => {
        if (error) {
            console.error(error);
            response.status(500).send('Error while inserting database')
        }
        response.status(201).send("Successful");
    })
}
const getTransactions = (request, response) => {
    const { company_symbol, quantity, unit_price, transaction_type, transaction_date } = request.body
    const amount  = quantity* unit_price;
    //validate transaction_type
    getBalance("NIB");
    pool.query('select * from stock_app.stock_transaction st inner join stock_app.stock_names sn on st.company_symbol = sn.company_symbol', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const getTotalBuy = (company_symbol) => {
    pool.query("select st.company_symbol, sum(st.quantity) as total_quantity, sum(amount) as total_amount from stock_app.stock_transaction st where st.transaction_type = 'buy' and st.company_symbol = $1 group by st.company_symbol", [company_symbol], (error, results) => {
        if (error) {
            throw error
        }
        return results.rows;
    })
}

const getTotalSell = (company_symbol) => {
    pool.query("select st.company_symbol, sum(st.quantity) as total_quantity, sum(amount) as total_amount from stock_app.stock_transaction st where st.transaction_type = 'sell' and st.company_symbol = $1 group by st.company_symbol", [company_symbol], (error, results) => {
        if (error) {
            throw error
        }
        return results.rows;
    })
}

const getBalance = async (company_symbol) => {
    const totalSell = await getTotalSell(company_symbol);
    const totalBuy = await getTotalBuy(company_symbol);
}

function findStock(listOfStocks,stockSymbol){
    listOfStocks.forEach(stock=>{
        if(stock.stock_symbol===stockSymbol){
            return stock;
        }
    });
    return {
        "company_symbol": stockSymbol,
        "total_quantity": 0,
        "total_amount": 0
    };
}

const getDashboard = (request, response) => {
    pool.query("select st.company_symbol, sn.company_name,sum(st.quantity) as total_quantity, sum(st.amount) as total_amount from stock_app.stock_transaction st inner join stock_app.stock_names sn on sn.company_symbol = st.company_symbol where st.transaction_type='buy'  group by st.company_symbol, sn.company_name",(error, buyResults) => {
        pool.query("select st.company_symbol, sn.company_name,sum(st.quantity) as total_quantity, sum(st.amount) as total_amount from stock_app.stock_transaction st inner join stock_app.stock_names sn on sn.company_symbol = st.company_symbol where st.transaction_type='sell'  group by st.company_symbol, sn.company_name",(error, saleResults) => {
            const result = [];
            buyResults.rows.forEach(buyStock=>{
               saleStock =  findStock(saleResults.rows,buyStock.company_symbol);
               const bal =  parseInt(buyStock.total_quantity )- parseInt(saleStock.total_quantity)
                result.push(
                   {
                       company_symbol:buyStock.company_symbol,
                       total_buy_amount : buyStock.total_amount,
                       total_buy_quantity : buyStock.total_quantity,
                       total_sale_amount : saleStock.total_amount,
                       balance_quantity : bal,
                       company_name: buyStock.company_name
                   }
               )
            });
            response.status(200).send(result);
        })

    })

}

const getTotalDashboard = (request, response) => {
    pool.query("select sum(st.quantity) as total_quantity, sum(st.amount) as total_amount from stock_app.stock_transaction st where st.transaction_type='buy'",(error, buyResults) => {
        pool.query("select sum(st.quantity) as total_quantity, sum(st.amount) as total_amount from stock_app.stock_transaction st where st.transaction_type='sell'",(error, saleResults) => {
            const result = [];
            const saleStock = saleResults.rows[0];
            const buyStock = buyResults.rows[0]
               const bal =  parseInt(buyStock.total_quantity )- parseInt(saleStock.total_quantity)
                result.push(
                   {
                       total_buy_amount : buyStock.total_amount,
                       total_buy_quantity : buyStock.total_quantity,
                       total_sale_amount : saleStock.total_amount,
                       balance_quantity : bal,
                   }
               )
            response.status(200).send(result);
        })

    })

}

module.exports = {
    getStockNames,
    transactStock,
    getTransactions,
    getDashboard,
    getTotalDashboard
}