import { DocumentDefinition, FilterQuery, UpdateQuery, QueryOptions } from "mongoose";
import Category, { CategoryDocument } from "../models/category.model";

export async function createCategory(input: DocumentDefinition<CategoryDocument>) {
  try {
    return await Category.create(input);
  } catch (error: any) {
    throw new Error(error);
  }
}

export async function findCategory(query: FilterQuery<CategoryDocument>) {
  try {
    return Category.findOne(query).lean();
  } catch (error: any) {
    return null;
  }
  
}

export async function getCategories(query: FilterQuery<CategoryDocument>) {
  return Category.find(query);
}

export function findAndUpdateCategory(
  query: FilterQuery<CategoryDocument>,
  update: UpdateQuery<CategoryDocument>,
  options: QueryOptions
) {
  return Category.findOneAndUpdate(query, update, options);
}

export function deleteCategory(query: FilterQuery<CategoryDocument>) {
  return Category.deleteOne(query);
}
