const express = require('express');
const router = express.Router();
const gpsService = require('../services/gpsService');

router.get('/distance', (req, res) => {
  try {
    const { lat1, lon1, lat2, lon2 } = req.query;
    const distance = gpsService.calculateDistance(parseFloat(lat1), parseFloat(lon1), parseFloat(lat2), parseFloat(lon2));
    res.json({ distance: distance.toFixed(2) + ' km' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/current', (req, res) => {
  const location = gpsService.getCurrentLocation();
  res.json(location);
});

router.get('/geocode', async (req, res) => {
  try {
    const { address } = req.query;
    const location = await gpsService.geocodeAddress(address);
    res.json(location);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;