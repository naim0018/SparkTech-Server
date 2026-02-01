"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateProductPrice = void 0;
const calculateProductPrice = (basePrice, discountedPrice, selectedVariants, totalQuantity, comboPricing) => {
    // 1. Determine base unit price
    const pricePerUnit = discountedPrice || basePrice;
    // 2. Calculate variant prices
    const variantTotal = selectedVariants.reduce((sum, v) => {
        return sum + (v.price * v.quantity);
    }, 0);
    // 3. Calculate subtotal
    const subtotal = (pricePerUnit * totalQuantity) + variantTotal;
    // 4. Apply combo discount
    let comboDiscount = 0;
    if (comboPricing && comboPricing.length > 0) {
        const sortedCombo = [...comboPricing].sort((a, b) => b.minQuantity - a.minQuantity);
        const tier = sortedCombo.find(t => totalQuantity >= t.minQuantity);
        if (tier) {
            comboDiscount = tier.discount;
        }
    }
    // 5. Calculate final total
    const finalTotal = Math.max(0, subtotal - comboDiscount);
    return {
        basePrice: pricePerUnit,
        variantTotal,
        subtotal,
        comboDiscount,
        finalTotal,
        totalQuantity
    };
};
exports.calculateProductPrice = calculateProductPrice;
