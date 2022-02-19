import { Express, Request, Response } from "express";
import { createUserHandler, getUsersHandler, updateUserHandler, deleteUserHandler } from "./controllers/user.controller";
import { createJobHandler, getJobsHandler, getJobsByUserHandler, getPictureByJobHandler, deleteJobHandler, updateJobHandler } from "./controllers/job.controller";

import validateRequest from './middleware/validate';
import { createUserSchema } from "./schemas/user.schema";
import { createJobSchema } from "./schemas/job.schema";

export default function (app: Express) {  

    app.post("/api/users", validateRequest(createUserSchema), createUserHandler);
    app.get("/api/users", getUsersHandler);
    app.put("/api/users/:user_id", updateUserHandler);
    app.delete("/api/users/:user_id", deleteUserHandler);

    app.post("/api/jobs", validateRequest(createJobSchema), createJobHandler);
    app.get("/api/jobs", getJobsHandler);
    app.get("/api/jobs/:job_id", getJobsHandler);
    app.get("/api/users/:user_id/jobs", getJobsByUserHandler);
    app.get("/api/jobs/:job_id/pictures", getPictureByJobHandler);
    app.delete("/api/jobs/:job_id", deleteJobHandler);
    app.put("/api/jobs/:job_id", updateJobHandler);
}