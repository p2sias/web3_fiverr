import { Express, Request, Response } from "express";
import { createUserHandler, getUsersHandler, updateUserHandler, deleteUserHandler } from "./controllers/user.controller";
import { createJobHandler, getJobsHandler, getJobsByUserHandler, getPictureByJobHandler, deleteJobHandler, updateJobHandler } from "./controllers/job.controller";
import { createCategoryHandler, getJobsByCategory, getCategoriesHandler, deleteCategoryHandler, updateCategoryHandler } from "./controllers/category.controller";
import { createPictureHandler, getPicturesHandler, deletePictureHandler } from "./controllers/picture.controller";
import { createAvatarHandler, getAvatarsHandler, deleteAvatarHandler, updateAvatarHandler } from "./controllers/avatar.controller";



import validateRequest from './middleware/validate';
import { createUserSchema } from "./schemas/user.schema";
import { createJobSchema } from "./schemas/job.schema";
import { createPictureSchema } from "./schemas/picture.schema";

export default function (app: Express) {  

    app.post("/api/users", validateRequest(createUserSchema), createUserHandler);
    app.get("/api/users", getUsersHandler);
    app.get("/api/users/:user_id", getUsersHandler);
    app.put("/api/users/:user_id", updateUserHandler);
    app.delete("/api/users/:user_id", deleteUserHandler);
    app.get("/api/users/wallet/:wallet_id", getUsersHandler);

    app.post("/api/jobs", validateRequest(createJobSchema), createJobHandler);
    app.get("/api/jobs", getJobsHandler);
    app.get("/api/jobs/:job_id", getJobsHandler);
    app.get("/api/users/:user_id/jobs", getJobsByUserHandler);
    app.get("/api/jobs/:job_id/pictures", getPictureByJobHandler);
    app.delete("/api/jobs/:job_id", deleteJobHandler);
    app.put("/api/jobs/:job_id", updateJobHandler);

    app.post("/api/pictures", validateRequest(createPictureSchema) , createPictureHandler);
    app.delete("/api/pictures/:picture_id", deletePictureHandler);
    app.get("/api/pictures", getPicturesHandler);
    app.get("/api/pictures/:picture_id", getPicturesHandler);

    //app.post("/api/avatars", createAvatarHandler);
    app.delete("/api/avatars/:avatar_id", deleteAvatarHandler);
    app.get("/api/avatars", getAvatarsHandler);
    app.get("/api/avatars/:avatar_id", getAvatarsHandler);
    app.put("/api/avatars/:avatar_id", updateAvatarHandler);


    app.post("/api/categories", createCategoryHandler);
    app.get("/api/categories/:category_id/jobs", getJobsByCategory);
    app.get("/api/categories", getCategoriesHandler);
    app.get("/api/categories/:category_id", getCategoriesHandler);
    app.delete("/api/categories/:category_id", deleteCategoryHandler);
    app.put("/api/categories/:category_id", updateCategoryHandler);
}