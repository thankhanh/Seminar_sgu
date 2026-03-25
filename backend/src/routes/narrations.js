const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client/edge');
const prisma = new PrismaClient();

// Hàm tính khoảng cách Haversine
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Bán kính Trái Đất (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Lấy narrations của store
router.get('/stores/:storeId', async (req, res) => {
  try {
    const narrations = await prisma.narration.findMany({
      where: { storeId: req.params.storeId, isActive: true },
      include: { language: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(narrations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Tìm narrations gần nhất
router.get('/nearby', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const language = req.query.language || 'vi';
    const radius = parseFloat(req.query.radius) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'lat and lng are required' });
    }

    // Tìm stores gần nhất
    const stores = await prisma.store.findMany({
      where: { status: 'active' },
      select: { id: true, name: true, lat: true, lng: true },
    });

    const nearbyStores = stores
      .map(store => ({
        ...store,
        distance: calculateDistance(lat, lng, store.lat, store.lng),
      }))
      .filter(store => store.distance <= radius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);

    // Lấy narrations
    const storeIds = nearbyStores.map(s => s.id);
    const narrations = await prisma.narration.findMany({
      where: {
        storeId: { in: storeIds },
        isActive: true,
        language: { code: language },
      },
      include: {
        store: { select: { name: true, address: true } },
        language: true,
      },
    });

    // Kết hợp với khoảng cách
    const result = narrations.map(narration => {
      const store = nearbyStores.find(s => s.id === narration.storeId);
      return {
        ...narration,
        distance: store?.distance || 0,
      };
    }).sort((a, b) => a.distance - b.distance);

    res.json({ data: result, userLat: lat, userLng: lng, language, radius });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ghi nhận listen (giả sử có auth middleware)
router.post('/listen/:narrationId', async (req, res) => {
  try {
    // Giả sử userId từ auth
    const userId = req.user?.id; // Cần auth middleware
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const narration = await prisma.narration.findUnique({
      where: { id: req.params.narrationId },
    });

    if (!narration) {
      return res.status(404).json({ error: 'Narration not found' });
    }

    const listenHistory = await prisma.listenHistory.create({
      data: {
        userId,
        storeId: narration.storeId,
        narrationId: req.params.narrationId,
        source: req.query.source === 'qr' ? 'qr' : 'gps',
      },
    });

    res.json(listenHistory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;