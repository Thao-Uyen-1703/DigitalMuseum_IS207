require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const productRoute = require('./routes/productRoute');
const diadiemRoute = require('./routes/diadiemRoute');
const authRoute = require('./routes/authRoute');
const cartRoute = require('./routes/cartRoute');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONT_END_URL,
    credentials: true
}));

app.use('/api/product', productRoute);
app.use('/api/diadiem', diadiemRoute);
app.use('/api/auth', authRoute);
app.use('/api/cart', cartRoute);

app.listen(port, () => {
    console.log(`Running at port:${port}`);
});