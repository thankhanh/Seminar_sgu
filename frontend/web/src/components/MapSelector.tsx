import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icons in Leaflet + Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapSelectorProps {
    lat: number;
    lng: number;
    onChange: (lat: number, lng: number) => void;
    onAddressChange?: (address: string) => void;
}

// Sub-component to handle map clicks
const LocationPicker = ({ onChange, onAddressChange }: { 
    onChange: (lat: number, lng: number) => void,
    onAddressChange?: (address: string) => void
}) => {
    const reverseGeocode = async (lat: number, lng: number) => {
        if (!onAddressChange) return;
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
                headers: { 'Accept-Language': 'vi' }
            });
            const data = await response.json();
            if (data.display_name) {
                onAddressChange(data.display_name);
            }
        } catch (error) {
            console.error('Error reverse geocoding:', error);
        }
    };

    useMapEvents({
        click(e) {
            onChange(e.latlng.lat, e.latlng.lng);
            reverseGeocode(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};

// Sub-component to update map view when props change
const ChangeView = ({ center }: { center: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center);
    }, [center, map]);
    return null;
};

const MapSelector: React.FC<MapSelectorProps> = ({ lat, lng, onChange, onAddressChange }) => {
    const position: [number, number] = [Number(lat) || 10.4967, Number(lng) || 105.1167];

    const handleDragEnd = async (e: any) => {
        const marker = e.target;
        const pos = marker.getLatLng();
        onChange(pos.lat, pos.lng);
        
        if (onAddressChange) {
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.lat}&lon=${pos.lng}&zoom=18&addressdetails=1`, {
                    headers: { 'Accept-Language': 'vi' }
                });
                const data = await response.json();
                if (data.display_name) {
                    onAddressChange(data.display_name);
                }
            } catch (error) {
                console.error('Error reverse geocoding:', error);
            }
        }
    };

    return (
        <div className="h-[300px] w-full rounded-xl overflow-hidden border border-slate-200 z-0">
            <MapContainer 
                center={position} 
                zoom={15} 
                scrollWheelZoom={true}
                className="h-full w-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker 
                    position={position}
                    draggable={true}
                    eventHandlers={{
                        dragend: handleDragEnd
                    }}
                />
                <LocationPicker onChange={onChange} onAddressChange={onAddressChange} />
                <ChangeView center={position} />
            </MapContainer>
            <div className="bg-slate-50 p-2 text-[10px] text-slate-500 font-mono text-center border-t border-slate-200">
                Click hoặc kéo thả Marker để chọn vị trí chính xác (Tự động cập nhật địa chỉ)
            </div>
        </div>
    );
};

export default MapSelector;
