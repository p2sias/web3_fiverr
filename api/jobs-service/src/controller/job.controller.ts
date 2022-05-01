import { Request, Response } from "express";
import { createJob, findJob, findAndUpdateJob, getJobs, deleteJob } from "../service/job.service";
import { createPicture, getPictures, deletePicture } from "../service/picture.service";
import log from "../logger";
import { get } from "lodash";

export async function createJobHandler(req: Request, res: Response) {
  try {
    
    const newJob = req.body
    const job = await createJob({
      title: newJob.title,
      about: newJob.about,
      category: newJob.category,
      plans: newJob.plans,
      user: newJob.user,
      user_address: newJob.user_address
    });

    for(const b64pic of newJob.photos) {
      await createPicture({job: job._id, image: b64pic});
    }

    return res.send(job.toJSON());
  } catch (e: any) {
    log.error(e);
    return res.status(409).send(e.message);
  }
}

export async function updateJobHandler(req: Request, res: Response) {
  const { params } = req;

  if (!params.job_id) return res.sendStatus(400);
  
  const update = req.body;

  const job = await findJob({ _id: params.job_id });

  if (!job) {
    return res.sendStatus(404);
  }

  const updatedJob = await findAndUpdateJob({ _id: params.job_id }, update, { new: true });

  return res.send(updatedJob);
}

export async function getJobsByUserHandler(req: Request, res: Response) {
  try {
    const { params } = req;
    const jobs = await getJobs({user: params.user_id});

    if (jobs) {
      return res.send(jobs);
    }
  } catch (e: any) {
    log.error(e);
    return res.status(409).send(e.message);
  }
}

export async function getPictureByJobHandler(req: Request, res: Response) {
  try {
    const { params } = req;
    const pictures = await getPictures({job: params.job_id});

    if (pictures) {
      return res.send(pictures);
    }
  } catch (e: any) {
    log.error(e);
    return res.status(409).send(e.message);
  }
}

export async function getJobsHandler(req: Request, res: Response) {
  try {

    let query = {};
    const { params } = req;

    if (params && params.job_id) query = { _id: params.job_id };

    const jobs = await getJobs(query);

    if (jobs) {
      return res.send(jobs);
    }
  } catch (e: any) {
    log.error(e);
    return res.status(409).send(e.message);
  }
}

export async function deleteJobHandler(req: Request, res: Response) {
  const { params } = req;

  if(!params.job_id)  return res.sendStatus(400);

  let job = await findJob({ _id: params.job_id });

  if (!job) {
    return res.sendStatus(404);
  }

  if (job.photos) {
    for (const photo of job.photos) {
      await deletePicture({ _id: photo });
    }
  }

  await deleteJob({ _id: params.job_id });

  return res.sendStatus(200);
}

