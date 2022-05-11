const express = require('express');
const product = require('./routes/product');
const purchase = require('./routes/purchase');
const user = require('./routes/user');
const healthCheck = require('./routes/healthcheck');
const cors = require('cors');

app = express();
app.use(express.json());
app.use(cors());

app.use('/', healthCheck);
app.use('/product', product);
app.use('/buy', purchase);
app.use('/add', user)

// const port = process.env.PORT || 5000;
// const port = process.env.PORT || 80;
const port = 5000;
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})