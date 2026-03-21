require('dotenv').config();
const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

// Routes
const translationRoutes = require('./routes/translation');
const gpsRoutes = require('./routes/gps');

app.use('/api/translate', translationRoutes);
app.use('/api/gps', gpsRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});