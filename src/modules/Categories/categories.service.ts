import { Request } from "express";
import { CategorySchema } from "./categories.model";
import { ICategory, ISubCategory } from "./categories.interface";
import { getTenantModel } from "../../app/utils/getTenantModel";

const createCategory = async (req: Request, category: ICategory) => {
    const Category = getTenantModel(req, 'Category', CategorySchema);
    const newCategory = await Category.create(category);
    return newCategory;
}
const createSubCategory = async (req: Request, categoryId: string, subCategory: ISubCategory) => {
    const Category = getTenantModel(req, 'Category', CategorySchema);
    const category = await Category.findById(categoryId);
    if (!category) {
        throw new Error('Category not found');
    }
    category.subCategories?.push(subCategory);
    await category.save();
    
    return category;
}

const updateCategoryOrder = async (req: Request, categories: { id: string; order: number }[]) => {
    const Category = getTenantModel(req, 'Category', CategorySchema);
    const session = await Category.startSession();
    session.startTransaction();

    try {
        const bulkOps = categories.map(({ id, order }) => ({
            updateOne: {
                filter: { _id: id },
                update: { $set: { order } }
            }
        }));

        await Category.bulkWrite(bulkOps, { session });
        await session.commitTransaction();
        
        return { success: true };
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

const getAllCategories = async (req: Request) => {
    const Category = getTenantModel(req, 'Category', CategorySchema);
    const categories = await Category.find().sort({ order: 1 });
    return categories;
}

const getCategoryById = async (req: Request, id: string) => {
    const Category = getTenantModel(req, 'Category', CategorySchema);
    const category = await Category.findById(id);
    return category;
}

const updateCategory = async (req: Request, id: string, category: ICategory) => {
    const Category = getTenantModel(req, 'Category', CategorySchema);
    const updatedCategory = await Category.findByIdAndUpdate(id, category, { new: true });
    return updatedCategory;
}

const deleteCategory = async (req: Request, id: string) => {
    const Category = getTenantModel(req, 'Category', CategorySchema);
    const deletedCategory = await Category.findByIdAndDelete(id, { new: true });
    return deletedCategory;
}

const deleteSubCategory = async (req: Request, categoryId: string, subCategoryName: string) => {
    const Category = getTenantModel(req, 'Category', CategorySchema);
    const category = await Category.findById(categoryId);
    if (!category) {
        throw new Error('Category not found');
    }

    const updatedSubCategories = category.subCategories?.filter(
        (subCategory) => subCategory.name !== subCategoryName
    );

    const updatedCategory = await Category.findByIdAndUpdate(
        categoryId,
        { subCategories: updatedSubCategories },
        { new: true }
    );

    return updatedCategory;
}

const updateSubCategory = async (
  req: Request,
  categoryId: string, 
  oldName: string, 
  updatedSubCategory: ISubCategory
) => {
  const Category = getTenantModel(req, 'Category', CategorySchema);
  const category = await Category.findById(categoryId);
  if (!category || !category.subCategories) throw new Error('Category not found');

  const subCategoryIndex = category.subCategories.findIndex(
    sub => sub.name === oldName
  );
  
  if (subCategoryIndex === -1) throw new Error('Subcategory not found');
  
  category.subCategories[subCategoryIndex] = updatedSubCategory;
  await category.save();
  return category;
};

export const categoryService = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
    deleteSubCategory,
    createSubCategory,
    updateCategoryOrder,
    updateSubCategory
}

