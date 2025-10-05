const mongoose = require('mongoose');

const mainOrderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderNumber: {
        type: String,
        unique: true,
        required: true
    },
    products: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        image: {
            type: String,
            required: true
        }
    }],
    shippingAddress: {
        fullName: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        addressLine1: {
            type: String,
            required: true
        },
        addressLine2: {
            type: String,
            default: ''
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        pincode: {
            type: String,
            required: true
        },
        country: {
            type: String,
            default: 'India'
        }
    },
    orderSummary: {
        subtotal: {
            type: Number,
            required: true
        },
        shipping: {
            type: Number,
            required: true
        },
        tax: {
            type: Number,
            required: true
        },
        total: {
            type: Number,
            required: true
        }
    },
    // status: {
    //     type: String,
    //     default: 'pending_payment'
    // }
}, {
    timestamps: true
});

// SIMPLIFIED pre-save hook
mainOrderSchema.pre('save', async function (next) {
    if (this.isNew) {
        try {
            const count = await mongoose.model('mainOrder').countDocuments();
            this.orderNumber = `ORD${Date.now()}${count + 1}`;
            console.log("Generated orderNumber in pre-save:", this.orderNumber);
        } catch (error) {
            console.error("Error generating orderNumber:", error);
        }
    }
    next();
});

module.exports = mongoose.models.mainOrder || mongoose.model('mainOrder', mainOrderSchema);