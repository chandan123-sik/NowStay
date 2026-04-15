export const roomCategories = [
    {
        type: 'Double Bed A/C',
        count: 20,
        price: 2500,
        size: '120 sq. ft.',
        capacity: '2 + 1 pax',
        bed: 'King Size',
        amenities: ['Electric Kettle', 'Flat TV', 'Free WiFi', 'Geyser', 'Split AC'],
        image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'
    },
    {
        type: 'Deluxe Triple Bed',
        count: 16,
        price: 3500,
        size: '230 sq. ft',
        capacity: '3 + 1 pax',
        bed: 'King + Single',
        amenities: ['Electric Kettle', 'Flat TV', 'Free WiFi', 'Geyser', 'Sofa', 'Split AC'],
        image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80'
    },
    {
        type: 'Four Bed Suite',
        count: 10,
        price: 5500,
        size: '330 sq. ft',
        capacity: '4 + 2 pax',
        bed: '2 Queen Size',
        amenities: ['Electric Kettle', 'Flat TV', 'Free WiFi', 'Geyser', 'Sofa', 'Split AC', 'Tea Table', 'Toiletries'],
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'
    }
];

// Generate individual 46 rooms for the admin panel
export const generateIndividualRooms = () => {
    const rooms = [];
    let roomNo = 101;

    roomCategories.forEach(cat => {
        for (let i = 0; i < cat.count; i++) {
            rooms.push({
                id: roomNo,
                roomNumber: roomNo.toString(),
                type: cat.type,
                status: Math.random() > 0.3 ? 'available' : 'occupied',
                lastCleaned: '2026-03-12'
            });
            roomNo++;
        }
    });

    return rooms;
};
