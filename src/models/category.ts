import { model, Schema } from "mongoose";

export interface ICategory extends Document {
  name: string;
}

const schema = new Schema<ICategory>({
  name: {
    type: String,
    trim: true,
    required: true,
    unique: true,
  },
});

const Category = model<ICategory>("Category", schema);

export default Category;
