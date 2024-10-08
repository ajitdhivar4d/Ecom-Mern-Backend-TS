import { Schema, model } from "mongoose";
// Define the Review schema
const reviewSchema = new Schema({
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
}, { timestamps: true });
// Define the Product schema
const productSchema = new Schema({
    name: { type: String, required: true },
    image: { type: String, required: true },
    brand: { type: String, required: true },
    quantity: { type: Number, required: true },
    category: String,
    description: { type: String, required: true },
    reviews: [reviewSchema],
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    price: { type: Number, required: true, default: 0 },
    countInStock: { type: Number, required: true, default: 0 },
}, { timestamps: true });
// Create the Product model
const Product = model("Product", productSchema);
export default Product;
