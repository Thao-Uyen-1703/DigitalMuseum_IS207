require('dotenv').config();

const express = require('express');
const cors = require('cors');

const productRoute = require('./routes/productRoute');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

app.use('/api/product', productRoute);

app.listen(port, () => {
    console.log(`Running at port:${port}`);
});