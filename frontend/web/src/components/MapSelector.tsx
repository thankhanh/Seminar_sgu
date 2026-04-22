import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Search, MapPin, Loader2 } from 'lucide-react';

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
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
};

const MapSelector: React.FC<MapSelectorProps> = ({ lat, lng, onChange, onAddressChange }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchTimeout = useRef<any>(null);

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

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        if (!query || query.length < 3) {
            setSuggestions([]);
            return;
        }

        searchTimeout.current = setTimeout(async () => {
            setIsSearching(true);
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`, {
                    headers: { 'Accept-Language': 'vi' }
                });
                const data = await response.json();
                setSuggestions(data);
                setShowSuggestions(true);
            } catch (error) {
                console.error('Error searching address:', error);
            } finally {
                setIsSearching(false);
            }
        }, 800);
    };

    const selectSuggestion = (item: any) => {
        const newLat = parseFloat(item.lat);
        const newLng = parseFloat(item.lon);
        onChange(newLat, newLng);
        if (onAddressChange) onAddressChange(item.display_name);
        setSearchQuery(item.display_name);
        setSuggestions([]);
        setShowSuggestions(false);
    };

    return (
        <div className="space-y-3">
            {/* Search Input */}
            <div className="relative z-50">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text"
                        placeholder="Tìm địa chỉ trên bản đồ..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                        className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 shadow-sm text-sm"
                    />
                    {isSearching && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-500 animate-spin" size={18} />
                    )}
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto z-[9999]">
                        {suggestions.map((item, index) => (
                            <button
                                key={index}
                                onClick={() => selectSuggestion(item)}
                                className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 flex items-start gap-2"
                            >
                                <MapPin className="text-slate-400 shrink-0 mt-1" size={14} />
                                <span className="text-sm text-slate-700 line-clamp-2">{item.display_name}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Leaflet Map */}
            <div className="h-[300px] w-full rounded-2xl overflow-hidden border border-slate-200 z-0 shadow-inner relative">
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
                <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-md p-2 rounded-lg text-[10px] text-white font-medium text-center z-[1000] border border-white/10 pointer-events-none">
                    Kéo thả Marker hoặc chốt địa chỉ qua ô tìm kiếm để lấy vị trí chính xác
                </div>
            </div>
        </div>
    );
};

export default MapSelector;

