import { Request, Response } from "express";
import axios from 'axios';
import log from "../logger";

import { avatarsApiUrl } from '../config'

export async function createAvatarHandler(req: Request, res: Response) {
  await axios.post(avatarsApiUrl, req.body)
    .then((response: any) => {
      log.info("Succefully created new avatar")
      res.status(200).send(response.data);
    })
    .catch((err: any) => {
      log.error("Failed to create avatar")
      console.log(err);
    })
}

export async function getAvatarsHandler(req: Request, res: Response) {
  const { params } = req;
  let query_id = ""
  if (params && params.avatar_id) query_id = `/${params.avatar_id}`

  await axios.get(avatarsApiUrl + query_id)
    .then((response: any) => res.status(200).send(response.data))
    .catch((err: any) => {
      log.error(`Failed to get avatars`)
      console.log(err);
    })
}

export async function deleteAvatarHandler(req: Request, res: Response) {
    const { params } = req;

    await axios.delete(`${avatarsApiUrl}/${params.avatar_id}`)
        .then(() => {
            log.info(`Succefully deleted avatar(${params.avatar_id})`)
            res.status(200).send();
        })
        .catch((err: any) => {
            log.error(`Failed to delete avatar(${params.avatar_id})`)
            console.log(err);
            res.status(500).send()
        });
}
