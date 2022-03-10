import { Request, Response } from "express";
import axios from 'axios';
import log from "../logger";

import { categoriesApiUrl } from '../config'

export async function createCategoryHandler(req: Request, res: Response) {
  await axios.post(categoriesApiUrl, req.body)
    .then((response: any) => {
      log.info("Succefully created new category")
      res.status(200).send(response.data);
    })
    .catch((err: any) => {
      log.error("Failed to create category")
      console.log(err);
    })
}

export async function getJobsByCategory(req: Request, res: Response) {
  const { params } = req;
  if (!params || !params.category_id) res.status(400).send("Please provide a category id")

  await axios.get(categoriesApiUrl + `/${params.category_id}/jobs`)
    .then((response: any) => res.status(200).send(response.data))
    .catch((err: any) => {
      log.error(`Failed to get jobs of category(${params.category_id})`)
      console.log(err);
    })
}

export async function updateCategoryHandler(req: Request, res: Response) {
  const { params } = req;

  if (!params.category_id) return res.sendStatus(400);

  await axios.put(`${categoriesApiUrl}/${params.category_id}`, req.body)
    .then((response: any) => {
      log.info(`Succefully updated category(${params.category_id})`)
      res.status(200).send(response.data);
    })
    .catch((err: any) => {
      log.error(`Failed to update category(${params.category_id})`)
      console.log(err);
    })
}

export async function getCategoriesHandler(req: Request, res: Response) {
  const { params } = req;
  let query_id = ""
  if (params && params.category_id) query_id = `/${params.category_id}`

  await axios.get(categoriesApiUrl + query_id)
    .then((response: any) => res.status(200).send(response.data))
    .catch((err: any) => {
      log.error(`Failed to get categories`)
      console.log(err);
    })
}

export async function deleteCategoryHandler(req: Request, res: Response) {
  const { params } = req;

  if (!params.category_id) return res.sendStatus(400);

   await axios.delete(`${categoriesApiUrl}/${params.category_id}`)
     .then(() => {
       log.info(`Succefully deleted category(${params.category_id})`)
       res.status(200)
     })
    .catch((err: any) => {
      log.error(`Failed to delete category(${params.category_id})`)
      console.log(err);
      res.status(500)
    })
}
