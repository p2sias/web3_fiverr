import { Request, Response } from "express";
import { createCategory, findCategory, findAndUpdateCategory, getCategories, deleteCategory } from "../service/category.service"
import { getJobs, findAndUpdateJob } from "../service/job.service";
import log from "../logger";


/**
 * CREATE CATEGORY
 * 
 * @param req Request 
 * @param res Response
 * @returns Response status code
 */
export async function createCategoryHandler(req: Request, res: Response) {
  try {
    const category = await createCategory(req.body);
    return res.send(category.toJSON());
  } catch (e: any) {
    log.error(e);
    return res.status(409).send(e.message);
  }
}


/**
 * UPDATE CATEGORY
 * 
 * @param req Request 
 * @param res Response
 * @returns Response status code
 */
export async function updateCategoryHandler(req: Request, res: Response) {
   const { params } = req;

  if (!params.category_id) return res.sendStatus(400);
  const update = req.body;

  const category = await findCategory({ _id: params.category_id });

  if (!category) {
    return res.sendStatus(404);
  }

  const updatedCategory = await findAndUpdateCategory({ _id: params.category_id }, update, { new: true });

  return res.send(updatedCategory);
}

/**
 * GET JOBS BY CATEGORY
 * 
 * @param req Request 
 * @param res Response
 * @returns Response status code
 */
export async function getJobsByCategoryHandler(req: Request, res: Response) {
  try {
    const { params } = req;
    const jobs = await getJobs({category: params.category_id});

    if (jobs) {
      return res.send(jobs);
    }
  } catch (e: any) {
    log.error(e);
    return res.status(409).send(e.message);
  }
}

/**
 * GET CATEGORY/IES
 * 
 * @param req Request 
 * @param res Response
 * @returns Response status code
 */
export async function getCategoriesHandler(req: Request, res: Response) {
  try {
    let query = {};
    const { params } = req;

    if (params && params.category_id) query = { _id: params.category_id };

    const categories = await getCategories(query);

    if (categories) {
      return res.send(categories);
    }
  } catch (e: any) {
    log.error(e);
    return res.status(409).send(e.message);
  }
}


/**
 * DELETE CATEGORY
 * 
 * @param req Request 
 * @param res Response
 * @returns Response status code
 */
export async function deleteCategoryHandler(req: Request, res: Response) {
  const { params } = req;

  if(!params.category_id)  return res.sendStatus(400);

  let category = await findCategory({ _id: params.category_id });

  if (!category) {
    return res.sendStatus(404);
  }

  const jobs = await getJobs({ category: category._id });

  for (const job of jobs) {
    await findAndUpdateJob({ _id: job._id }, { category: null }, { new: true });
  }

  await deleteCategory({ _id: params.category_id });

  return res.sendStatus(200);
}