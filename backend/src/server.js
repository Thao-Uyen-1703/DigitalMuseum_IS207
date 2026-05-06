require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const productRoute = require('./routes/productRoute');
const diadiemRoute = require('./routes/diadiemRoute');
const authRoute = require('./routes/authRoute');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

app.use('/api/product', productRoute);
app.use('/api/diadiem', diadiemRoute);
app.use('/api/auth', authRoute);

app.listen(port, () => {
    console.log(`Running at port:${port}`);
});