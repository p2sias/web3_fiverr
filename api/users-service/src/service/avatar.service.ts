import { DocumentDefinition, FilterQuery, UpdateQuery, QueryOptions } from "mongoose";
import Avatar, { AvatarDocument } from "../models/avatar.model";

export async function createAvatar(input: DocumentDefinition<AvatarDocument>) {
  try {
    return await Avatar.create(input);
  } catch (error: any) {
    throw new Error(error);
  }
}

export async function findAvatar(query: FilterQuery<AvatarDocument>) {
  return Avatar.findOne(query).lean();
}

export async function getAvatars(query: FilterQuery<AvatarDocument>) {
  return Avatar.find(query);
}

export function findAndUpdateAvatar(
  query: FilterQuery<AvatarDocument>,
  update: UpdateQuery<AvatarDocument>,
  options: QueryOptions
) {
  return Avatar.findOneAndUpdate(query, update, options);
}

export function deleteAvatar(query: FilterQuery<AvatarDocument>) {
  return Avatar.deleteOne(query);
}

