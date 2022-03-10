import { Request, Response } from "express";
import { createPicture, getPictures, deletePicture, findPicture  } from "../service/picture.service";
import { findJob, findAndUpdateJob, getJobs } from "../service/job.service";
import log from "../logger";
import { get } from "lodash";

export async function createPictureHandler(req: Request, res: Response) {
  try {
    const picture = await createPicture(req.body);

    const job = await findJob({ _id: picture.job });

    if (!job)
    {
      log.error(`Job ${picture.job} not found !`);
      return res.sendStatus(404);
    }

    job.photos.push(picture._id);

    await findAndUpdateJob({ _id: job._id }, job, { new: true })
      .then(() => log.info(`New image (${picture._id}) added to job (${job._id})`));


    return res.send(picture.toJSON());
  } catch (e: any) {
    log.error(e);
    return res.status(409).send(e.message);
  }
}

export async function getPicturesHandler(req: Request, res: Response) {
  try {

    let query = {};
    const { params } = req;

    if (params && params.picture_id) query = { _id: params.picture_id };

    const pictures = await getPictures(query);

    if (pictures) {
      return res.send(pictures);
    }
  } catch (e: any) {
    log.error(e);
    return res.status(409).send(e.message);
  }
}

export async function deletePictureHandler(req: Request, res: Response) {
  const { params } = req;

  if(!params.picture_id)  return res.sendStatus(400);

  let picture = await findPicture({ _id: params.picture_id });

  if (!picture) {
    return res.sendStatus(404);
  }

  let job = await findJob({ _id: picture.job });

  if (job)
  {
    job.photos.splice(job.photos.indexOf(picture._id), 1);
    await findAndUpdateJob({ _id: job._id }, job, { new: true });
  }

  await deletePicture({ _id: params.picture_id });

  return res.sendStatus(200);
}

