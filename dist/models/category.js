import { model, Schema } from "mongoose";
const schema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        unique: true,
    },
});
const Category = model("Category", schema);
export default Category;
