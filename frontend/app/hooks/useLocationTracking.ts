import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import api from '../constants/api';

interface NearbyStore {
  id: string;
  name: string;
  coverImage?: string;
  distance?: number;
}

export default function useLocationTracking(intervalMs: number = 20000, radiusKm: number = 0.1) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [nearbyStore, setNearbyStore] = useState<NearbyStore | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  // To avoid showing the same store modal too frequently
  const lastShownStoreId = useRef<string | null>(null);
  const lastShownTime = useRef<number>(0);
  const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      // Start watching location
      const subscriber = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: intervalMs,
          distanceInterval: 10, // meters
        },
        (loc) => {
          setLocation(loc);
          checkNearbyStores(loc.coords.latitude, loc.coords.longitude);
        }
      );

      return () => {
        if (subscriber) subscriber.remove();
      };
    })();
  }, []);

  const checkNearbyStores = async (lat: number, lng: number) => {
    try {
      const { data } = await api.get('/stores/nearby', {
        params: { lat, lng, radius: radiusKm, limit: 1 },
      });

      if (data.success && data.data && data.data.length > 0) {
        const store = data.data[0];
        
        // Cooldown and uniqueness check
        const now = Date.now();
        if (store.id !== lastShownStoreId.current || (now - lastShownTime.current) > COOLDOWN_MS) {
          setNearbyStore(store);
          setIsModalVisible(true);
          lastShownStoreId.current = store.id;
          lastShownTime.current = now;
        }
      }
    } catch (error) {
      console.warn('Error checking nearby stores:', error);
    }
  };

  const closeALert = () => setIsModalVisible(false);

  return {
    location,
    errorMsg,
    nearbyStore,
    isModalVisible,
    closeALert,
  };
}
