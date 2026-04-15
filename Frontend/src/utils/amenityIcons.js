import {
    Wifi, Wind, Tv, Coffee, Utensils, Waves,
    Droplets, Sparkles, Box, Sofa, Trees,
    Smartphone, Monitor, Shield, Zap, Info, ChevronRight,
    CigaretteOff, UserCheck, Car, Briefcase,
    Bath, Bed, Clock, MapPin, Phone, Plane, ShoppingBag,
    Star, Sun, Trash, Umbrella, User, Users, X
} from 'lucide-react';

const mapping = {
    // Basic
    'WiFi': Wifi,
    'Free WiFi': Wifi,
    'High Speed Internet': Wifi,
    'Split AC': Wind,
    'Air Conditioning': Wind,
    'Television': Tv,
    'Flat TV': Tv,
    'Smart TV': Tv,
    'Cable TV': Tv,
    'Coffee': Coffee,
    'Electric Kettle': Coffee,
    'Tea/Coffee Maker': Coffee,
    'Meals': Utensils,
    'Breakfast': Utensils,
    'Mini Fridge': Box,
    'Geyser': Droplets,
    'Hot Water': Droplets,
    'Toiletries': Sparkles,
    'Premium Toiletries': Sparkles,

    // Views & Features
    'Ocean View': Waves,
    'Beach View': Waves,
    'Sea View': Waves,
    'View Facing': Waves,
    'Balcony': Trees,
    'Private Balcony': Trees,
    'Living Area': Sofa,
    'Sitting Area': Sofa,
    'WORKSPACE': Briefcase,

    // Others
    'Safety Box': Shield,
    'Power Backup': Zap,
    'Room Service': UserCheck,
    'Laundry': ShoppingBag,
    'Parking': Car,
};

export const getAmenityIcon = (name) => {
    if (!name) return ChevronRight;

    // Normalize string
    const normalized = name.trim();

    // Direct match
    if (mapping[normalized]) return mapping[normalized];

    // Fuzzy match (contains)
    const key = Object.keys(mapping).find(k =>
        normalized.toLowerCase().includes(k.toLowerCase()) ||
        k.toLowerCase().includes(normalized.toLowerCase())
    );

    return key ? mapping[key] : ChevronRight;
};

export const commonAmenityNames = Object.keys(mapping);
export default mapping;
