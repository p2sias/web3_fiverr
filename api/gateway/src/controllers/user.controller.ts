import { Request, Response } from "express";
import axios from 'axios';
import log from "../logger";

import { usersApiUrl, jobsApiUrl } from '../config'

export async function createUserHandler(req: Request, res: Response) {
  await axios.post(usersApiUrl, req.body)
    .then((response: any) => {
      log.info("Succefully created new user")
      res.status(200).send(response.data);
    })
    .catch((err: any) => {
      log.error("Failed to create user")
      console.log(err);
    })
}

export async function updateUserHandler(req: Request, res: Response) {
  const { params } = req;

  if (!params.user_id) return res.sendStatus(400);

  await axios.put(`${usersApiUrl}/${params.user_id}`, req.body)
    .then((response: any) => {
      log.info(`Succefully updated user(${params.user_id})`)
      res.status(200).send(response.data);
    })
    .catch((err: any) => {
      log.error(`Failed to update user(${params.user_id})`)
      console.log(err);
    })
}

export async function getUsersHandler(req: Request, res: Response) {
  const { params } = req;
  let query_id = ""

  if (params.user_id) query_id = `/${params.user_id}`
  if (params.wallet_id) query_id = `/wallet/${params.wallet_id}`

  await axios.get(usersApiUrl + query_id)
    .then((response: any) => {
      res.status(200).send(response.data)
    })
    .catch((err: any) => {
      res.status(404).send()
    })
}

export async function deleteUserHandler(req: Request, res: Response) {
  const { params } = req;

  if (!params.user_id) return res.sendStatus(400);

  await axios.get(usersApiUrl + '/' + params.user_id)
    .then(async (response: any) => {
      
      let user = response.data[0];
      for (const job of user.jobs) {
        
        await axios.delete(`${jobsApiUrl}/${job}`)
          .then(() => {
            log.info(`Succefully deleted job(${job})`)
            res.status(200)
          })
          .catch((err: any) => {
            log.error(`Failed to delete job(${job})`)
            console.log(err);
            res.status(500).send(err)
          })
      }

    })
    .catch((err: any) => {
      log.error(`Failed to get users`)
      console.log(err);
    })

  await axios.delete(`${usersApiUrl}/${params.user_id}`)
    .then(() => {
      log.info(`Succefully deleted user(${params.user_id})`)
      res.status(200).send();
    })
    .catch((err: any) => {
      log.error(`Failed to delete user(${params.user_id})`)
      console.log(err);
      res.status(500).send()
    });
}
