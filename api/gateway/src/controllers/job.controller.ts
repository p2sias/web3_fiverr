import { Request, Response } from "express";
import axios from 'axios';
import log from "../logger";

import { categoriesApiUrl, jobsApiUrl, usersApiUrl } from '../config'

export async function createJobHandler(req: Request, res: Response) {

  const userId = req.body.user;
  const categoryId = req.body.category;

  let user: any = await axios.get(usersApiUrl + `/${userId}`)
  user = user.data[0]

  let category: any = await axios.get(categoriesApiUrl + `/${categoryId}`)
  category = category.data[0];

  await axios.post(jobsApiUrl, req.body)
    .then(async (response: any) => {
      log.info("Succefully created new job")
            
      user.jobs.push(response.data._id);

      await axios.put(`${usersApiUrl}/${user._id}`, { jobs: user.jobs })
        .then((response: any) => {
          log.info(`Succefully updated user(${user._id})`)
        })
        .catch((err: any) => {
          log.error(`Failed to update user(${user._id})`)
          console.log(err);
        });

      res.status(200).send(response.data);
    })
    .catch((err: any) => {
      log.error("Failed to create job")
      console.log(err);
      res.status(500).send(err)
    });
}

export async function updateJobHandler(req: Request, res: Response) {
  const { params } = req;

  if (!params.job_id) return res.sendStatus(400);

  await axios.put(`${jobsApiUrl}/${params.job_id}`, req.body)
    .then((response: any) => {
      log.info(`Succefully updated job(${params.job_id})`)
      res.status(200).send(response.data);
    })
    .catch((err: any) => {
        log.error(`Failed to update job(${params.job_id})`)
        console.log(err);
        res.status(500).send(err)
    })
}

export async function getJobsHandler(req: Request, res: Response) {
  const { params } = req;
  let query_id = ""
  if (params && params.job_id) query_id = `/${params.job_id}`

  await axios.get(jobsApiUrl + query_id)
    .then((response: any) => res.status(200).send(response.data))
    .catch((err: any) => {
        log.error(`Failed to get jobs`)
        console.log(err);
        res.status(500).send(err)
        
    })
}

export async function deleteJobHandler(req: Request, res: Response) {
  const { params } = req;

  if (!params.job_id) return res.sendStatus(400);

   await axios.delete(`${jobsApiUrl}/${params.job_id}`)
     .then(() => {
       log.info(`Succefully deleted job(${params.job_id})`)
       res.status(200)
     })
    .catch((err: any) => {
      log.error(`Failed to delete job(${params.job_id})`)
      console.log(err);
      res.status(500).send(err)
    })
}

export async function getJobsByUserHandler(req: Request, res: Response) {
    const { params } = req;
    
    if (!params || !params.user_id) res.send(400).send("Please provide user id")

    await axios.get(usersApiUrl + `/${params.user_id}/jobs`)
        .then((response: any) => res.status(200).send(response.data))
        .catch((err: any) => {
            log.error(`Failed to get jobs of user(${params.user_id})`)
            console.log(err);
            res.status(500).send(err)
        })
}

export async function getPictureByJobHandler(req: Request, res: Response) {
  const { params } = req;
    
    if (!params || !params.job_id) res.send(400).send("Please provide job id")

    await axios.get(jobsApiUrl + `/${params.job_id}/pictures`)
        .then((response: any) => res.status(200).send(response.data))
        .catch((err: any) => {
            log.error(`Failed to get pictures of jobs(${params.user_id})`)
            console.log(err);
            res.status(500).send(err)
        })
}
