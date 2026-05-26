require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const path = require('path');
const saltRounds = 10;

const productRoute = require('./routes/productRoute');
const diadiemRoute = require('./routes/diadiemRoute');
const authRoute = require('./routes/authRoute');
const cartRoute = require('./routes/cartRoute');
const shipmentRoute = require('./routes/shipmentRoute');
const checkoutRoute = require('./routes/checkoutRoute');
const trackingRoute = require('./routes/trackingRoute');
const orderRoute = require('./routes/orderRoute');
const profileRoute = require('./routes/profileRoute');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONT_END_URL,
    credentials: true
}));

app.use('/images', express.static(path.join(__dirname, '../public/images')));
app.use('/api/product', productRoute);
app.use('/api/diadiem', diadiemRoute);
app.use('/api/auth', authRoute);
app.use('/api/cart', cartRoute);
app.use('/api/shipment-methods', shipmentRoute);
app.use('/api/checkout', checkoutRoute);
app.use('/api/tracking', trackingRoute);
app.use('/api/order', orderRoute);
app.use('/api/profile', profileRoute);

app.listen(port, () => {
    console.log(`Running at port:${port}`);
});