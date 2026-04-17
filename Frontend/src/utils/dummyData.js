export const bookings = [
    { id: 'BK001', guest: 'John Doe', room: '101', checkIn: '2026-03-15', checkOut: '2026-03-18', status: 'Confirmed', amount: 7500 },
    { id: 'BK002', guest: 'Jane Smith', room: '205', checkIn: '2026-03-20', checkOut: '2026-03-22', status: 'Pending', amount: 10500 },
    { id: 'BK003', guest: 'Michael Brown', room: '302', checkIn: '2026-03-12', checkOut: '2026-03-14', status: 'Checked In', amount: 16500 },
    { id: 'BK004', guest: 'Sarah Wilson', room: '104', checkIn: '2026-03-10', checkOut: '2026-03-11', status: 'Completed', amount: 2500 },
];

export const users = [
    { id: 'U001', name: 'John Doe', email: 'john@example.com', role: 'user', joined: '2026-01-10', balance: 5000 },
    { id: 'U002', name: 'Sarah Wilson', email: 'sarah@example.com', role: 'user', joined: '2026-02-15', balance: 1200 },
    { id: 'U003', name: 'Admin User', email: 'admin@nowstay.com', role: 'admin', joined: '2025-12-01', balance: 0 },
];

export const discountCodes = [
    { id: 'D001', code: 'WELCOME500', type: 'Flat', value: 500, active: true, used: 45 },
    { id: 'D002', code: 'STAY10', type: 'Percentage', value: 10, active: true, used: 120 },
    { id: 'D003', code: 'LUXE20', type: 'Percentage', value: 20, active: false, used: 12 },
];
