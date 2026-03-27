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

// Lấy danh sách stores
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.store.findMany({
        skip,
        take: limit,
        where: { status: 'active' },
        select: {
          id: true, name: true, address: true, lat: true, lng: true,
          openTime: true, closeTime: true, coverImage: true, status: true,
          merchant: { select: { businessName: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.store.count({ where: { status: 'active' } }),
    ]);

    res.json({ data, total, page, limit });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Tìm stores gần nhất
router.get('/nearby', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radius = parseFloat(req.query.radius) || 5;
    const limit = parseInt(req.query.limit) || 20;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'lat and lng are required' });
    }

    const stores = await prisma.store.findMany({
      where: { status: 'active' },
      select: {
        id: true, name: true, address: true, lat: true, lng: true,
        openTime: true, closeTime: true, coverImage: true,
        merchant: { select: { businessName: true } },
      },
    });

    const nearbyStores = stores
      .map(store => ({
        ...store,
        distance: calculateDistance(lat, lng, store.lat, store.lng),
      }))
      .filter(store => store.distance <= radius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);

    res.json({ data: nearbyStores, userLat: lat, userLng: lng, radius });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Chi tiết store
router.get('/:id', async (req, res) => {
  try {
    const store = await prisma.store.findUnique({
      where: { id: req.params.id },
      include: {
        merchant: { select: { businessName: true } },
        images: true,
        menus: true,
        narrations: { include: { language: true } },
      },
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    res.json(store);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;