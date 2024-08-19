import mongoose, { Schema } from "mongoose";
const orderItemSchema = new Schema({
    name: { type: String, required: true },
    qty: { type: Number, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Product",
    },
});
const shippingAddressSchema = new Schema({
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
});
const paymentResultSchema = new Schema({
    id: { type: String },
    status: { type: String },
    update_time: { type: String },
    email_address: { type: String },
});
const orderSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
        index: true, // Index for faster queries
    },
    orderItems: [orderItemSchema],
    shippingAddress: shippingAddressSchema,
    paymentMethod: {
        type: String,
        required: true,
        enum: ["PayPal", "CreditCard", "Stripe"], // Example enum
    },
    paymentResult: paymentResultSchema,
    itemsPrice: {
        type: Number,
        required: true,
        default: 0.0,
        min: 0, // Ensures non-negative values
    },
    taxPrice: {
        type: Number,
        required: true,
        default: 0.0,
        min: 0,
    },
    shippingPrice: {
        type: Number,
        required: true,
        default: 0.0,
        min: 0,
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0,
        min: 0,
    },
    isPaid: {
        type: Boolean,
        required: true,
        default: false,
    },
    paidAt: {
        type: Date,
    },
    isDelivered: {
        type: Boolean,
        required: true,
        default: false,
    },
    deliveredAt: {
        type: Date,
    },
}, {
    timestamps: true,
});
const Order = mongoose.model("Order", orderSchema);
export default Order;
