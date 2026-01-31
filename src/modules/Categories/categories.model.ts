import Mongoose, { Schema } from "mongoose";
import { ICategory, ISubCategory } from "./categories.interface";


const SubCategorySchema = new Schema<ISubCategory>({
    name: { type: String, required: true },
    image: { type: String, required: false },
    description: { type: String, required: false },
}); 

const CategorySchema = new Schema<ICategory>({
    name: { type: String, required: true },
    image: { type: String, required: false },
    description: { type: String, required: false },
    order: { type: Number, required: false },
    subCategories: { type: [SubCategorySchema], required: false },
});
export { CategorySchema };
export const Category = Mongoose.model('Category', CategorySchema);



