import { Document, Schema, model } from "mongoose";

// Interface for the Review document
export interface IReview extends Document {
  name: string;
  rating: number;
  comment: string;
  user: Schema.Types.ObjectId;
}

// Interface for the Product document
export interface IProduct extends Document {
  _id?: string;
  name: string;
  image: string;
  brand: string;
  quantity: number;
  category: Schema.Types.ObjectId;
  description: string;
  reviews: IReview[];
  rating: number;
  numReviews: number;
  price: number;
  countInStock: number;
}

// Define the Review schema
const reviewSchema = new Schema<IReview>(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  { timestamps: true },
);

// Define the Product schema
const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
    brand: { type: String, required: true },
    quantity: { type: Number, required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    description: { type: String, required: true },
    reviews: [reviewSchema],
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    price: { type: Number, required: true, default: 0 },
    countInStock: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

// Create the Product model
const Product = model<IProduct>("Product", productSchema);

export default Product;
