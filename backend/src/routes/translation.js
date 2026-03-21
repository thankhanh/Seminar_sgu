const express = require('express');
const router = express.Router();
const translationService = require('../services/translationService');

router.post('/', async (req, res) => {
  try {
    const { text, from, to } = req.body;
    const translatedText = await translationService.translateText(text, from, to);
    res.json({ translatedText });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;