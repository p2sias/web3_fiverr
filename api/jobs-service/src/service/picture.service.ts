import { DocumentDefinition, FilterQuery, UpdateQuery, QueryOptions } from "mongoose";
import Picture, { PictureDocument } from "../models/picture.model";

export async function createPicture(input: DocumentDefinition<PictureDocument>) {
  try {
    return await Picture.create(input);
  } catch (error: any) {
    throw new Error(error);
  }
}

export async function findPicture(query: FilterQuery<PictureDocument>) {
  return Picture.findOne(query).lean();
}

export async function getPictures(query: FilterQuery<PictureDocument>) {
  return Picture.find(query);
}

export function findAndUpdatePicture(
  query: FilterQuery<PictureDocument>,
  update: UpdateQuery<PictureDocument>,
  options: QueryOptions
) {
  return Picture.findOneAndUpdate(query, update, options);
}

export function deletePicture(query: FilterQuery<PictureDocument>) {
  return Picture.deleteOne(query);
}

