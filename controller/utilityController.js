const Cart = require('../models/cart.schema');
const Pack = require('../models/pack.schema');

const updateAllCarts = async () => {
    try {
        const carts = await Cart.find().populate('products.product').populate('packs.pack');

        for (const cart of carts) {
            let totalPrice = 0;

            // Calculate the total price for products
            for (const item of cart.products) {
                const product = item.product;
                if (!product || !product.pricePerUnit || !item.quantity) {
                    console.error(`Invalid product or quantity for cart item: ${item}`);
                    continue;
                }
                totalPrice += product.pricePerUnit * item.quantity;
            }

            // Calculate the total price for packs
            for (const item of cart.packs) {
                const pack = item.pack;
                if (!pack || !pack.products || !Array.isArray(pack.products)) {
                    console.error(`Invalid pack or products for cart item: ${item}`);
                    continue;
                }

                const packTotalPrice = pack.products.reduce((acc, prod) => {
                    if (!prod.product || !prod.product.pricePerUnit || !prod.quantity) {
                        console.error(`Invalid product or quantity in pack: ${prod}`);
                        return acc;
                    }
                    return acc + (prod.product.pricePerUnit * prod.quantity);
                }, 0);

                const afterDiscount = packTotalPrice * (1 - (pack.discount || 0) / 100);
                totalPrice += afterDiscount * item.quantity;
            }

            if (isNaN(totalPrice)) {
                console.error(`Calculated total price is NaN for cart: ${cart}`);
                continue; // Skip saving this cart if totalPrice is NaN
            }

            cart.totalPrice = totalPrice;
            await cart.save();
        }
    } catch (err) {
        console.error('Error updating all carts:', err);
        throw new Error('Error updating all carts');
    }
};


// Function to update all packs
const updateAllPacks = async () => {
    try {
        const packs = await Pack.find().populate('products.product');

        for (const pack of packs) {
            // Recalculate the total price of the pack
            const totalPrice = pack.products.reduce((acc, p) => {
                return acc + (p.product.pricePerUnit * p.quantity);
            }, 0);

            const afterDiscount = totalPrice * (1 - (pack.discount || 0) / 100);

            pack.initTotalPrice = totalPrice;
            pack.price = afterDiscount;

            await pack.save();
        }
    } catch (err) {
        console.error('Error updating all packs:', err);
        throw new Error('Error updating all packs');
    }
};

module.exports = {
    updateAllCarts,
    updateAllPacks
};

