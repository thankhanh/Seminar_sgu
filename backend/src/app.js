require('dotenv').config();
const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

// Routes
const translationRoutes = require('./routes/translation');
const gpsRoutes = require('./routes/gps');
const storesRoutes = require('./routes/stores');
const narrationsRoutes = require('./routes/narrations');
const qrRoutes = require('./routes/qr');

app.use('/api/translate', translationRoutes);
app.use('/api/gps', gpsRoutes);
app.use('/api/stores', storesRoutes);
app.use('/api/narrations', narrationsRoutes);
app.use('/api/qr', qrRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});