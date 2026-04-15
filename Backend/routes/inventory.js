import express from 'express';
import Inventory from '../models/Inventory.js';
import RoomType from '../models/RoomType.js';
import Pricing from '../models/Pricing.js';
import RoomVariant from '../models/RoomVariant.js';

const router = express.Router();

const normalizeDate = (d) => {
    const date = new Date(d);
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
};

// @desc    Get inventory & rate matrix (per variant)
router.get('/matrix', async (req, res) => {
    const { startDate, roomTypeId } = req.query;
    const start = normalizeDate(startDate || new Date());
    const days = 10;

    try {
        const hQuery = { isActive: true };
        if (roomTypeId && roomTypeId !== 'all') {
            hQuery.roomType = roomTypeId;
        }

        // Return matrix at the variant level
        const variants = await RoomVariant.find(hQuery).populate('roomType');

        const dates = Array.from({ length: days }, (_, i) => {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            return d;
        });

        const matrix = await Promise.all(variants.map(async (v) => {
            const pricingPlans = await Pricing.find({ roomVariant: v._id }).populate('ratePlan');

            const end = new Date(dates[days - 1]);
            end.setDate(end.getDate() + 1);

            const overrides = await Inventory.find({
                roomVariant: v._id,
                date: { $gte: start, $lt: end }
            });

            const overrideMap = {};
            overrides.forEach(ov => {
                overrideMap[normalizeDate(ov.date).toISOString()] = ov;
            });

            const availabilityRow = dates.map(date => {
                const ov = overrideMap[date.toISOString()];
                const totalForDate = ov?.roomsToSell ?? v.totalRooms;
                const netAvailable = totalForDate - (ov?.bookedUnits || 0);

                return {
                    date,
                    roomsToSell: netAvailable,
                    isStopSell: ov ? ov.isStopSell : false
                };
            });

            const ratesMapping = pricingPlans.map(plan => {
                return {
                    planId: plan._id,
                    planName: plan.planName,
                    ratePlanCode: plan.ratePlan?.code || 'CUSTOM',
                    dailyRates: dates.map(date => {
                        const ov = overrideMap[date.toISOString()];
                        const specificOverride = ov?.rates?.find(r => r.pricingPlan.toString() === plan._id.toString());
                        return {
                            date,
                            adult1Price: specificOverride ? specificOverride.adult1Price : plan.adult1Price,
                            adult2Price: specificOverride ? specificOverride.adult2Price : plan.adult2Price,
                            extraAdultPrice: specificOverride ? specificOverride.extraAdultPrice : plan.extraAdultPrice,
                            childPrice: specificOverride ? specificOverride.childPrice : plan.childPrice
                        };
                    })
                };
            });

            return {
                _id: v._id,
                variantId: v._id,
                roomTypeId: v.roomType._id,
                name: `${v.roomType.name} - ${v.name}`,
                totalRooms: v.totalRooms,
                availability: availabilityRow,
                plans: ratesMapping
            };
        }));

        res.json({ dates, matrix });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching matrix' });
    }
});

router.post('/save-batch', async (req, res) => {
    const { updates } = req.body;
    try {
        for (const item of updates) {
            const date = normalizeDate(item.date);
            const targetId = item.variantId || item.roomTypeId;

            let ov = await Inventory.findOne({ roomVariant: targetId, date });
            if (!ov) {
                const variant = await RoomVariant.findById(targetId);
                if (!variant) continue;
                ov = new Inventory({ roomVariant: targetId, roomType: variant.roomType, date, rates: [] });
            }

            if (item.roomsToSell !== undefined) ov.roomsToSell = Math.max(0, parseInt(item.roomsToSell) || 0);
            if (item.isStopSell !== undefined) ov.isStopSell = item.isStopSell;

            if (item.planUpdates) {
                item.planUpdates.forEach(pu => {
                    // Use a more robust way to find/update subdocs
                    let r = ov.rates.find(pr => pr.pricingPlan.toString() === pu.planId);

                    if (!r) {
                        ov.rates.push({
                            pricingPlan: pu.planId,
                            adult1Price: pu.adult1Price || 0,
                            adult2Price: pu.adult2Price || 0,
                            extraAdultPrice: pu.extraAdultPrice || 0,
                            childPrice: pu.childPrice || 0
                        });
                    } else {
                        if (pu.adult1Price !== undefined) r.adult1Price = pu.adult1Price;
                        if (pu.adult2Price !== undefined) r.adult2Price = pu.adult2Price;
                        if (pu.extraAdultPrice !== undefined) r.extraAdultPrice = pu.extraAdultPrice;
                        if (pu.childPrice !== undefined) r.childPrice = pu.childPrice;
                    }
                });
                // CRITICAL: Ensure Mongoose knows the subdocs changed
                ov.markModified('rates');
            }
            await ov.save();
        }
        res.json({ message: 'Batch save successful' });
    } catch (error) {
        console.error('Batch Save Error Details:', error);
        res.status(500).json({ message: 'Batch save failed', error: error.message });
    }
});

router.post('/bulk-update', async (req, res) => {
    const { roomTypeId, variantId, fromDate, toDate, selectedDays, updates, planUpdates } = req.body;
    try {
        if (updates && updates.roomsToSell !== undefined) {
            updates.roomsToSell = Math.max(0, parseInt(updates.roomsToSell) || 0);
        }
        const start = normalizeDate(fromDate);
        const end = normalizeDate(toDate);
        let current = new Date(start);
        const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

        // Determine target: variant or roomType
        const targetVariantId = variantId;

        while (current <= end) {
            const dayName = dayNames[current.getDay()];
            if (selectedDays[dayName]) {
                let ov = await Inventory.findOne({ roomVariant: targetVariantId, date: current });
                if (!ov) {
                    const variant = await RoomVariant.findById(targetVariantId);
                    ov = new Inventory({ roomVariant: targetVariantId, roomType: variant.roomType, date: current, rates: [] });
                }

                if (updates.roomsToSell !== undefined) ov.roomsToSell = updates.roomsToSell;
                if (updates.isStopSell !== undefined) ov.isStopSell = updates.isStopSell;

                // Per-plan rate updates (new format with individual plan control)
                if (planUpdates && planUpdates.length > 0) {
                    planUpdates.forEach(pu => {
                        let r = ov.rates.find(pr => pr.pricingPlan.toString() === pu.planId);
                        if (!r) {
                            r = { pricingPlan: pu.planId };
                            ov.rates.push(r);
                        }
                        if (pu.adult1Price !== undefined) r.adult1Price = pu.adult1Price;
                        if (pu.adult2Price !== undefined) r.adult2Price = pu.adult2Price;
                        if (pu.extraAdultPrice !== undefined) r.extraAdultPrice = pu.extraAdultPrice;
                        if (pu.childPrice !== undefined) r.childPrice = pu.childPrice;
                    });
                    ov.markModified('rates');
                }
                // Backward compatibility: generic rate updates applied to all plans
                else if (updates.adult2Price) {
                    const plans = await Pricing.find({ roomVariant: targetVariantId });
                    plans.forEach(plan => {
                        let r = ov.rates.find(pr => pr.pricingPlan.toString() === plan._id.toString());
                        if (!r) {
                            r = { pricingPlan: plan._id };
                            ov.rates.push(r);
                        }
                        r.adult2Price = updates.adult2Price;
                        if (updates.adult1Price) r.adult1Price = updates.adult1Price;
                        if (updates.extraAdultPrice) r.extraAdultPrice = updates.extraAdultPrice;
                        if (updates.childPrice) r.childPrice = updates.childPrice;
                    });
                    ov.markModified('rates');
                }

                await ov.save();
            }
            current.setDate(current.getDate() + 1);
        }
        res.json({ message: 'Bulk update successful' });
    } catch (error) {
        console.error('Bulk Update Error Details:', error);
        res.status(500).json({ message: 'Bulk update failed', error: error.message });
    }
});

export default router;
