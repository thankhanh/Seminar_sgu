"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.comparePassword = comparePassword;
exports.gpsDistance = gpsDistance;
exports.generateQrCode = generateQrCode;
exports.sanitizeUser = sanitizeUser;
const bcrypt = require("bcryptjs");
async function hashPassword(plain) {
    return bcrypt.hash(plain, 12);
}
async function comparePassword(plain, hash) {
    return bcrypt.compare(plain, hash);
}
function gpsDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function generateQrCode(storeId) {
    const short = storeId.replace(/-/g, '').substring(0, 8).toUpperCase();
    return `STORE-${short}`;
}
function sanitizeUser(user) {
    const { passwordHash, ...safe } = user;
    return safe;
}
//# sourceMappingURL=helpers.js.map