import { Request, Response } from "express";
import axios from 'axios';
import log from "../logger";

import { jobsApiUrl, picturesApiUrl } from '../config'

export async function createPictureHandler(req: Request, res: Response) {
  await axios.post(picturesApiUrl, req.body)
    .then((response: any) => {
      log.info("Succefully created new picture")
      res.status(200).send(response.data);
    })
    .catch((err: any) => {
      log.error("Failed to create picture")
      console.log(err);
    })
}

export async function getPicturesHandler(req: Request, res: Response) {
  const { params } = req;
  let query_id = ""
  if (params && params.picture_id) query_id = `/${params.picture_id}`

  await axios.get(picturesApiUrl + query_id)
    .then((response: any) => res.status(200).send(response.data))
    .catch((err: any) => {
      log.error(`Failed to get pictures`)
      console.log(err);
    })
}

export async function deletePictureHandler(req: Request, res: Response) {
    const { params } = req;

    await axios.delete(`${picturesApiUrl}/${params.picture_id}`)
        .then(() => {
            log.info(`Succefully deleted picture(${params.picture_id})`)
            res.status(200).send();
        })
        .catch((err: any) => {
            log.error(`Failed to delete picture(${params.picture_id})`)
            console.log(err);
            res.status(500).send()
        });
}
