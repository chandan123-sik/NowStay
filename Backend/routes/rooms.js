import express from 'express';
import RoomType from '../models/RoomType.js';
import Pricing from '../models/Pricing.js';
import Booking from '../models/Booking.js';
import RoomVariant from '../models/RoomVariant.js';
import Inventory from '../models/Inventory.js';

const router = express.Router();

const normalizeDate = (d) => {
    const date = new Date(d);
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
};

// @desc    Get all room types with starting price
// @route   GET /api/rooms
router.get('/', async (req, res) => {
    try {
        const { date } = req.query;
        const targetDate = date ? new Date(date) : new Date();
        targetDate.setUTCHours(0, 0, 0, 0);

        const roomTypes = await RoomType.find({ isActive: true });

        const enriched = await Promise.all(roomTypes.map(async (type) => {
            const variants = await RoomVariant.find({ roomType: type._id });

            // Calculate starting price and availability
            let minPrice = Infinity;
            let totalAvailable = 0;

            for (const v of variants) {
                // Price check
                const minPlan = await Pricing.findOne({ roomVariant: v._id }).sort({ adult2Price: 1 });
                if (minPlan && minPlan.adult2Price < minPrice) {
                    minPrice = minPlan.adult2Price;
                }

                // Availability check
                const inv = await Inventory.findOne({ roomVariant: v._id, date: targetDate });
                if (inv?.isStopSell) continue;

                const limit = inv?.roomsToSell ?? v.totalRooms;
                const booked = inv?.bookedUnits ?? 0;
                totalAvailable += Math.max(0, limit - booked);
            }

            return {
                ...type.toObject(),
                startingPrice: minPrice === Infinity ? 0 : minPrice,
                availableRooms: totalAvailable
            };
        }));

        res.json(enriched);
    } catch (error) {
        console.error('Error fetching room types:', error);
        res.status(500).json({ message: 'Error fetching room types' });
    }
});

// Backward compatibility (optional but good for stability)
router.get('/categories', async (req, res) => {
    try {
        const roomTypes = await RoomType.find({ isActive: true });
        const enriched = await Promise.all(roomTypes.map(async (type) => {
            const variant = await RoomVariant.findOne({ roomType: type._id });
            const minPlan = variant ? await Pricing.findOne({ roomVariant: variant._id }).sort({ adult2Price: 1 }) : null;
            return {
                _id: type._id,
                type: type.name,
                size: type.size,
                bed: type.bedType,
                capacity: type.capacity,
                price: minPlan ? minPlan.adult2Price : 0,
                amenities: type.amenities,
                image: type.images[0],
                count: type.totalRooms,
                startingPrice: minPlan ? minPlan.adult2Price : 0,
                images: type.images,
                name: type.name
            };
        }));
        res.json(enriched);
    } catch (error) {
        res.status(500).json({ message: 'Error' });
    }
});

// @desc    Get ALL variants for a room type with dynamic starting prices
router.post('/variants-with-pricing', async (req, res) => {
    const { roomTypeId, checkIn, checkOut, roomDetails } = req.body;
    try {
        const roomType = await RoomType.findById(roomTypeId);
        if (!roomType) return res.status(404).json({ message: 'Room type not found' });
        const variants = await RoomVariant.find({ roomType: roomTypeId });
        const start = checkIn ? normalizeDate(checkIn) : null;
        const end = checkOut ? normalizeDate(checkOut) : null;

        const results = await Promise.all(variants.map(async (v) => {
            // Find the lowest price plan for this variant
            const plans = await Pricing.find({ roomVariant: v._id });
            if (plans.length === 0) return { ...v.toObject(), basePrice: 0 };

            let lowestTotal = Infinity;
            let isStopped = false;
            let minAvail = Infinity;

            // Fetch overrides once per variant
            const overrides = (start && end) ? await Inventory.find({
                roomVariant: v._id,
                date: { $gte: start, $lt: end }
            }) : [];

            if (start && end) {
                isStopped = overrides.some(o => o.isStopSell);
                // Pre-calculate min availability for the range
                const rangeStart = new Date(start);
                for (let d = new Date(rangeStart); d < end; d.setDate(d.getDate() + 1)) {
                    const dateStr = d.toISOString().split('T')[0];
                    const override = overrides.find(o => o.date.toISOString().split('T')[0] === dateStr);
                    const totalForDate = override?.roomsToSell ?? v.totalRooms;
                    const netAvailable = totalForDate - (override?.bookedUnits || 0);
                    if (netAvailable < minAvail) minAvail = netAvailable;
                }
            }

            for (const plan of plans) {
                let currentTotal = 0;

                if (start && end) {
                    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
                        const dateStr = d.toISOString().split('T')[0];
                        const override = overrides.find(o => o.date.toISOString().split('T')[0] === dateStr);
                        const rateOverride = override?.rates?.find(r => r.pricingPlan.toString() === plan._id.toString());

                        const dp = {
                            adult1: rateOverride?.adult1Price ?? plan.adult1Price,
                            adult2: rateOverride?.adult2Price ?? plan.adult2Price,
                            extraAdult: rateOverride?.extraAdultPrice ?? plan.extraAdultPrice,
                            child: rateOverride?.childPrice ?? plan.childPrice
                        };

                        if (roomDetails) {
                            roomDetails.forEach(room => {
                                if (room.adults === 1) currentTotal += dp.adult1;
                                else if (room.adults === 2) currentTotal += dp.adult2;
                                else currentTotal += (dp.adult2 + dp.extraAdult);
                                currentTotal += (room.children * dp.child);
                            });
                        } else {
                            currentTotal += dp.adult2;
                        }
                    }
                } else {
                    currentTotal = plan.adult2Price; // Fallback
                }
                if (currentTotal < lowestTotal) lowestTotal = currentTotal;
            }

            const nightCount = (start && end) ? Math.max(1, Math.round((end - start) / 86400000)) : 1;
            const avgPrice = lowestTotal === Infinity ? 0 : Math.round(lowestTotal / nightCount);

            return {
                ...v.toObject(),
                basePrice: avgPrice,
                pricingPlanMeta: plans.length > 0 ? plans[0] : null,
                isSoldOut: minAvail <= 0,
                isStopSell: isStopped,
                availableCount: minAvail
            };
        }));

        // Calculate overall pricing meta averages for the stay duration
        let avgMeta = { adult1: 0, adult2: 0, extraAdult: 0, child: 0 };
        if (results.length > 0 && start && end) {
            const firstVariant = variants[0];
            const plans = await Pricing.find({ roomVariant: firstVariant._id });
            const plan = plans[0] || { adult1Price: 0, adult2Price: 0, extraAdultPrice: 0, childPrice: 0 };

            const overrides = await Inventory.find({
                roomVariant: firstVariant._id,
                date: { $gte: start, $lt: end }
            });

            let sum1 = 0, sum2 = 0, sumEx = 0, sumCh = 0;
            const days = Math.max(1, Math.round((end - start) / 86400000));

            for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
                const dateStr = d.toISOString().split('T')[0];
                const ov = overrides.find(o => o.date.toISOString().split('T')[0] === dateStr);
                const rateOv = ov?.rates?.find(r => r.pricingPlan.toString() === plan._id?.toString());

                sum1 += rateOv?.adult1Price ?? plan.adult1Price;
                sum2 += rateOv?.adult2Price ?? plan.adult2Price;
                sumEx += rateOv?.extraAdultPrice ?? plan.extraAdultPrice;
                sumCh += rateOv?.childPrice ?? plan.childPrice;
            }

            avgMeta = {
                adult1: Math.round(sum1 / days),
                adult2: Math.round(sum2 / days),
                extraAdult: Math.round(sumEx / days),
                child: Math.round(sumCh / days)
            };
        } else if (results.length > 0) {
            // No dates yet, use first variant's first plan as generic preview
            const meta = results[0]?.pricingPlanMeta;
            if (meta) {
                avgMeta = {
                    adult1: meta.adult1Price,
                    adult2: meta.adult2Price,
                    extraAdult: meta.extraAdultPrice,
                    child: meta.childPrice
                };
            }
        }

        const meta = avgMeta;
        const suggestedTotal = results[0]?.lowestTotal || 0; // Use the lowest price of the first variant as estimate

        res.json({
            variants: results,
            pricingMeta: meta,
            suggestedTotal
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching variants with pricing' });
    }
});

// @desc    Get variants for a specific room type
router.get('/variants/:roomTypeId', async (req, res) => {
    try {
        const variants = await RoomVariant.find({ roomType: req.params.roomTypeId });
        res.json(variants);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching variants' });
    }
});

// @desc    Create a new variant
router.post('/variants', async (req, res) => {
    try {
        const variant = await RoomVariant.create(req.body);
        res.status(201).json(variant);
    } catch (error) {
        res.status(500).json({ message: 'Error creating variant' });
    }
});

// @desc    Update a variant
router.put('/variants/:id', async (req, res) => {
    try {
        const variant = await RoomVariant.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(variant);
    } catch (error) {
        res.status(500).json({ message: 'Error updating variant' });
    }
});

// @desc    Delete a variant (Cascading delete)
router.delete('/variants/:id', async (req, res) => {
    try {
        await Promise.all([
            RoomVariant.findByIdAndDelete(req.params.id),
            Pricing.deleteMany({ roomVariant: req.params.id })
        ]);
        res.json({ message: 'Variant and associated pricing plans deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting variant' });
    }
});

// @desc    Get all plans for a variant with dynamic stay totals (Linked to Admin Rates Matrix)
router.post('/variant-plans-pricing', async (req, res) => {
    const { variantId, checkIn, checkOut, roomDetails } = req.body;
    try {
        const plans = await Pricing.find({ roomVariant: variantId }).populate('ratePlan').lean();
        const start = checkIn ? normalizeDate(checkIn) : null;
        const end = checkOut ? normalizeDate(checkOut) : null;

        const results = await Promise.all(plans.map(async (plan) => {
            let stayTotal = 0;

            if (start && end && !isNaN(start.getTime()) && !isNaN(end.getTime())) {
                const overrides = await Inventory.find({
                    roomVariant: variantId,
                    date: { $gte: start, $lt: end }
                }).lean();

                for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
                    const dateStr = d.toISOString().split('T')[0];
                    const override = overrides.find(o => new Date(o.date).toISOString().split('T')[0] === dateStr);
                    const rateOverride = override?.rates?.find(r => r.pricingPlan.toString() === plan._id.toString());

                    const dp = {
                        adult1: (rateOverride?.adult1Price > 0) ? rateOverride.adult1Price : (plan.adult1Price || 0),
                        adult2: (rateOverride?.adult2Price > 0) ? rateOverride.adult2Price : (plan.adult2Price || 0),
                        extraAdult: (rateOverride?.extraAdultPrice > 0) ? rateOverride.extraAdultPrice : (plan.extraAdultPrice || 0),
                        child: (rateOverride?.childPrice > 0) ? rateOverride.childPrice : (plan.childPrice || 0)
                    };

                    if (roomDetails && roomDetails.length > 0) {
                        roomDetails.forEach(room => {
                            if (room.adults === 1) stayTotal += dp.adult1;
                            else if (room.adults === 2) stayTotal += dp.adult2;
                            else stayTotal += (dp.adult2 + (room.adults - 2) * dp.extraAdult);
                            stayTotal += (room.children * dp.child);
                        });
                    } else {
                        stayTotal += dp.adult2;
                    }
                }
            }

            if (stayTotal === 0) {
                stayTotal = plan.adult2Price || 0;
            }

            const numNights = (start && end && !isNaN(start.getTime()) && !isNaN(end.getTime()))
                ? Math.max(1, Math.round((new Date(end) - new Date(start)) / 86400000))
                : 1;

            return {
                ...plan,
                dynamicTotal: stayTotal,
                avgNightly: stayTotal / numNights
            };
        }));

        res.json(results);
    } catch (error) {
        console.error('Pricing Error:', error);
        res.status(500).json({ message: 'Error calculating stay pricing' });
    }
});

// @desc    Get pricing for a variant
router.get('/pricing/:variantId', async (req, res) => {
    try {
        const pricing = await Pricing.find({ roomVariant: req.params.variantId }).populate('ratePlan');
        res.json(pricing);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching pricing' });
    }
});

// @desc    Get room type details
router.get('/:id', async (req, res) => {
    try {
        const roomType = await RoomType.findById(req.params.id);
        if (roomType) {
            res.json(roomType);
        } else {
            res.status(404).json({ message: 'Room type not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching room details' });
    }
});

// @desc    Check availability (multifaceted)
router.post('/check-availability', async (req, res) => {
    const { roomTypeId, variantId, checkIn, checkOut, roomsCount = 1 } = req.body;
    try {
        const roomType = await RoomType.findById(roomTypeId);
        const variant = await RoomVariant.findById(variantId);
        if (!roomType || !variant) return res.status(404).json({ message: 'Room/Variant not found' });

        const start = normalizeDate(checkIn);
        const end = normalizeDate(checkOut);

        // Check for Stop Sell or Manual Override in Inventory per variant
        const overrides = await Inventory.find({
            roomVariant: variantId,
            date: { $gte: start, $lt: end }
        });

        if (overrides.some(o => o.isStopSell)) {
            return res.json({ available: false, message: 'Dates are blocked (Stop Sell)' });
        }

        // Use Inventory recorded availability for all days
        let minAvailable = Infinity;
        for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            const override = overrides.find(o => o.date.toISOString().split('T')[0] === dateStr);

            const totalForDate = override?.roomsToSell ?? variant.totalRooms;
            const currentBooked = override?.bookedUnits ?? 0;
            const dayAvailable = totalForDate - currentBooked;

            if (dayAvailable < minAvailable) minAvailable = dayAvailable;
        }

        const countAvailable = minAvailable === Infinity ? variant.totalRooms : Math.max(0, minAvailable);

        res.json({
            available: countAvailable >= roomsCount,
            availableCount: countAvailable,
            totalRooms: variant.totalRooms
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Availability check failed' });
    }
});

// @desc    Calculate dynamic pricing for a date range
router.post('/calculate-pricing', async (req, res) => {
    const { roomTypeId, variantId, planId, checkIn, checkOut, roomDetails } = req.body;
    try {
        const start = normalizeDate(checkIn);
        const end = normalizeDate(checkOut);
        const basePlan = await Pricing.findById(planId);

        const overrides = await Inventory.find({
            roomVariant: variantId,
            date: { $gte: start, $lt: end }
        });

        let total = 0;
        let nightCount = 0;

        for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            const override = overrides.find(o => o.date.toISOString().split('T')[0] === dateStr);
            const rateOverride = override?.rates.find(r => r.pricingPlan.toString() === planId);

            const dayPrices = {
                adult1: rateOverride?.adult1Price ?? basePlan.adult1Price,
                adult2: rateOverride?.adult2Price ?? basePlan.adult2Price,
                extraAdult: rateOverride?.extraAdultPrice ?? basePlan.extraAdultPrice,
                child: rateOverride?.childPrice ?? basePlan.childPrice
            };

            // Calculate for each room in detail
            if (roomDetails) {
                roomDetails.forEach(room => {
                    let roomPrice = 0;
                    if (room.adults === 1) roomPrice = dayPrices.adult1;
                    else if (room.adults === 2) roomPrice = dayPrices.adult2;
                    else roomPrice = dayPrices.adult2 + dayPrices.extraAdult;

                    roomPrice += (room.children * dayPrices.child);
                    total += roomPrice;
                });
            } else {
                total += dayPrices.adult2; // Fallback
            }
            nightCount++;
        }

        res.json({ total, nightCount });
    } catch (error) {
        res.status(500).json({ message: 'Pricing calculation failed' });
    }
});

// Admin Routes
router.post('/', async (req, res) => {
    try {
        const roomType = await RoomType.create(req.body);
        res.status(201).json(roomType);
    } catch (error) {
        res.status(500).json({ message: 'Error creating room type' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const roomType = await RoomType.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(roomType);
    } catch (error) {
        res.status(500).json({ message: 'Error updating room type' });
    }
});

// @desc    Delete a room type (Cascading delete)
router.delete('/:id', async (req, res) => {
    try {
        // 1. Find all variants for this room type
        const variants = await RoomVariant.find({ roomType: req.params.id });
        const variantIds = variants.map(v => v._id);

        // 2. Perform cascading deletion
        await Promise.all([
            Pricing.deleteMany({ roomVariant: { $in: variantIds } }),
            RoomVariant.deleteMany({ roomType: req.params.id }),
            RoomType.findByIdAndDelete(req.params.id)
        ]);

        res.json({ message: 'Room type and all associated data deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting room type and its dependencies' });
    }
});

// @desc    Get real-time availability matrix for 14 days starting from a specific date
// @route   GET /api/rooms/availability-matrix
router.get('/availability-matrix', async (req, res) => {
    try {
        const { startDate } = req.query;
        const initialDate = startDate ? new Date(startDate) : new Date();
        initialDate.setHours(0, 0, 0, 0);

        const roomTypes = await RoomType.find({ isActive: true });
        const dates = Array.from({ length: 14 }, (_, i) => {
            const d = new Date(initialDate);
            d.setDate(initialDate.getDate() + i);
            return d;
        });

        const matrix = await Promise.all(roomTypes.map(async (type) => {
            const availability = await Promise.all(dates.map(async (date) => {
                const nextDate = new Date(date);
                nextDate.setDate(date.getDate() + 1);

                const bookings = await Booking.find({
                    roomType: type._id,
                    bookingStatus: { $in: ['pending', 'confirmed'] },
                    checkIn: { $lt: nextDate },
                    checkOut: { $gt: date }
                });

                const bookedCount = bookings.reduce((sum, b) => sum + b.roomsCount, 0);
                return {
                    date,
                    available: Math.max(0, type.totalRooms - bookedCount),
                    total: type.totalRooms
                };
            }));

            return {
                _id: type._id,
                name: type.name,
                totalRooms: type.totalRooms,
                availability
            };
        }));

        res.json(matrix);
    } catch (error) {
        console.error('Matrix Error:', error);
        res.status(500).json({ message: 'Error generating availability matrix' });
    }
});

export default router;
