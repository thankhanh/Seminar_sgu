const { Client } = require('@googlemaps/google-maps-services-js');

class GPSService {
  constructor() {
    this.client = new Client({});
  }

  // Tính khoảng cách giữa hai điểm GPS sử dụng công thức Haversine
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Bán kính Trái Đất trong km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Geocode địa chỉ thành tọa độ
  async geocodeAddress(address) {
    try {
      const response = await this.client.geocode({
        params: {
          address: address,
          key: process.env.GOOGLE_API_KEY,
        },
      });
      if (response.data.results.length > 0) {
        const location = response.data.results[0].geometry.location;
        return { lat: location.lat, lon: location.lng };
      } else {
        throw new Error('Address not found');
      }
    } catch (error) {
      throw new Error('Geocoding failed: ' + error.message);
    }
  }

  // Giả lập lấy vị trí hiện tại (trong thực tế, sử dụng GPS API)
  getCurrentLocation() {
    // Giả lập vị trí ở Hà Nội
    return { lat: 21.0285, lon: 105.8542 };
  }
}

module.exports = new GPSService();