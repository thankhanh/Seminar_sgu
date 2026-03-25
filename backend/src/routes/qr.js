const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client/edge');
const { v4: uuidv4 } = require('uuid');
const prisma = new PrismaClient();

// Resolve QR code
router.get('/:code', async (req, res) => {
  try {
    const qr = await prisma.qrCode.findUnique({
      where: { code: req.params.code },
      include: {
        store: {
          include: {
            merchant: { select: { businessName: true } },
            narrations: { include: { language: true } },
            menus: true,
          },
        },
      },
    });

    if (!qr || !qr.isActive) {
      return res.status(404).json({ error: 'QR code not found or inactive' });
    }

    res.json({ store: qr.store });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Scan QR và record listen
router.post('/scan/:code', async (req, res) => {
  try {
    // Giả sử userId từ auth
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const qr = await prisma.qrCode.findUnique({
      where: { code: req.params.code },
      include: {
        store: {
          include: {
            merchant: { select: { businessName: true } },
            narrations: { include: { language: true } },
            menus: true,
          },
        },
      },
    });

    if (!qr || !qr.isActive) {
      return res.status(404).json({ error: 'QR code not found or inactive' });
    }

    // Tìm narration mặc định (tiếng Việt)
    const defaultNarration = qr.store.narrations.find(n => n.language.code === 'vi' && n.isActive);
    if (defaultNarration) {
      await prisma.listenHistory.create({
        data: {
          userId,
          storeId: qr.store.id,
          narrationId: defaultNarration.id,
          source: 'qr',
        },
      });
    }

    res.json({ store: qr.store, listened: !!defaultNarration });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;