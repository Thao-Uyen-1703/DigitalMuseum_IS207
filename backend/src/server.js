require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const path = require('path');
const saltRounds = 10;

const productRoute = require('./routes/client/productRoute');
const diadiemRoute = require('./routes/client/diadiemRoute');
const authRoute = require('./routes/authRoute');
const cartRoute = require('./routes/client/cartRoute');
const shipmentRoute = require('./routes/client/shipmentRoute');
const checkoutRoute = require('./routes/client/checkoutRoute');
const trackingRoute = require('./routes/client/trackingRoute');
const orderRoute = require('./routes/client/orderRoute');
const profileRoute = require('./routes/client/profileRoute');

const statisticsRoute = require('./routes/admin/statisticsRoute');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: [process.env.FRONT_END_URL, process.env.ADMIN_URL],
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

app.use('/api/admin/statistics', statisticsRoute);

app.listen(port, () => {
    console.log(`Running at port:${port}`);
});