import { DocumentDefinition, FilterQuery, UpdateQuery, QueryOptions } from "mongoose";
import User, { UserDocument } from "../models/user.model";

export async function createUser(input: DocumentDefinition<UserDocument>) {
  try {
    return await User.create(input);
  } catch (error: any) {
    throw new Error(error);
  }
}

export async function findUser(query: FilterQuery<UserDocument>) {
  return User.findOne(query).lean();
}

export async function getUsers(query: FilterQuery<UserDocument>) {
  return User.find(query);
}

export function findAndUpdateUser(
  query: FilterQuery<UserDocument>,
  update: UpdateQuery<UserDocument>,
  options: QueryOptions
) {
  return User.findOneAndUpdate(query, update, options);
}

export function deleteUser(query: FilterQuery<UserDocument>) {
  return User.deleteOne(query);
}
