"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryService = void 0;
const categories_model_1 = require("./categories.model");
const getTenantModel_1 = require("../../app/utils/getTenantModel");
const createCategory = (req, category) => __awaiter(void 0, void 0, void 0, function* () {
    const Category = (0, getTenantModel_1.getTenantModel)(req, 'Category', categories_model_1.CategorySchema);
    const newCategory = yield Category.create(category);
    return newCategory;
});
const createSubCategory = (req, categoryId, subCategory) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const Category = (0, getTenantModel_1.getTenantModel)(req, 'Category', categories_model_1.CategorySchema);
    const category = yield Category.findById(categoryId);
    if (!category) {
        throw new Error('Category not found');
    }
    (_a = category.subCategories) === null || _a === void 0 ? void 0 : _a.push(subCategory);
    yield category.save();
    return category;
});
const updateCategoryOrder = (req, categories) => __awaiter(void 0, void 0, void 0, function* () {
    const Category = (0, getTenantModel_1.getTenantModel)(req, 'Category', categories_model_1.CategorySchema);
    const session = yield Category.startSession();
    session.startTransaction();
    try {
        const bulkOps = categories.map(({ id, order }) => ({
            updateOne: {
                filter: { _id: id },
                update: { $set: { order } }
            }
        }));
        yield Category.bulkWrite(bulkOps, { session });
        yield session.commitTransaction();
        return { success: true };
    }
    catch (error) {
        yield session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
});
const getAllCategories = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const Category = (0, getTenantModel_1.getTenantModel)(req, 'Category', categories_model_1.CategorySchema);
    const categories = yield Category.find().sort({ order: 1 });
    return categories;
});
const getCategoryById = (req, id) => __awaiter(void 0, void 0, void 0, function* () {
    const Category = (0, getTenantModel_1.getTenantModel)(req, 'Category', categories_model_1.CategorySchema);
    const category = yield Category.findById(id);
    return category;
});
const updateCategory = (req, id, category) => __awaiter(void 0, void 0, void 0, function* () {
    const Category = (0, getTenantModel_1.getTenantModel)(req, 'Category', categories_model_1.CategorySchema);
    const updatedCategory = yield Category.findByIdAndUpdate(id, category, { new: true });
    return updatedCategory;
});
const deleteCategory = (req, id) => __awaiter(void 0, void 0, void 0, function* () {
    const Category = (0, getTenantModel_1.getTenantModel)(req, 'Category', categories_model_1.CategorySchema);
    const deletedCategory = yield Category.findByIdAndDelete(id, { new: true });
    return deletedCategory;
});
const deleteSubCategory = (req, categoryId, subCategoryName) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const Category = (0, getTenantModel_1.getTenantModel)(req, 'Category', categories_model_1.CategorySchema);
    const category = yield Category.findById(categoryId);
    if (!category) {
        throw new Error('Category not found');
    }
    const updatedSubCategories = (_a = category.subCategories) === null || _a === void 0 ? void 0 : _a.filter((subCategory) => subCategory.name !== subCategoryName);
    const updatedCategory = yield Category.findByIdAndUpdate(categoryId, { subCategories: updatedSubCategories }, { new: true });
    return updatedCategory;
});
const updateSubCategory = (req, categoryId, oldName, updatedSubCategory) => __awaiter(void 0, void 0, void 0, function* () {
    const Category = (0, getTenantModel_1.getTenantModel)(req, 'Category', categories_model_1.CategorySchema);
    const category = yield Category.findById(categoryId);
    if (!category || !category.subCategories)
        throw new Error('Category not found');
    const subCategoryIndex = category.subCategories.findIndex(sub => sub.name === oldName);
    if (subCategoryIndex === -1)
        throw new Error('Subcategory not found');
    category.subCategories[subCategoryIndex] = updatedSubCategory;
    yield category.save();
    return category;
});
exports.categoryService = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
    deleteSubCategory,
    createSubCategory,
    updateCategoryOrder,
    updateSubCategory
};
