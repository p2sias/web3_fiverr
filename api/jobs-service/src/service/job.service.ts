import { DocumentDefinition, FilterQuery, UpdateQuery, QueryOptions } from "mongoose";
import Job, { JobDocument } from "../model/job.model";

export async function createJob(input: DocumentDefinition<JobDocument>) {
  try {
    return await Job.create(input);
  } catch (error: any) {
    throw new Error(error);
  }
}

export async function findJob(query: FilterQuery<JobDocument>) {
  return Job.findOne(query).lean();
}

export async function getJobs(query: FilterQuery<JobDocument>) {
  return Job.find(query);
}

export function findAndUpdateJob(
  query: FilterQuery<JobDocument>,
  update: UpdateQuery<JobDocument>,
  options: QueryOptions
) {
  return Job.findOneAndUpdate(query, update, options);
}

export function deleteJob(query: FilterQuery<JobDocument>) {
  return Job.deleteOne(query);
}



