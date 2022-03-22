import { Express, Request, Response } from "express";
import { createUserHandler, getUsersHandler, updateUserHandler, deleteUserHandler } from "./controller/user.controller";
import { createAvatarHandler, getAvatarsHandler, deleteAvatarHandler, updateAvatarHandler } from "./controller/avatar.controller";

export default function (app: Express) {  
    app.post("/api/users", createUserHandler);
    app.get("/api/users", getUsersHandler);
    app.get("/api/users/:user_id", getUsersHandler);
    app.put("/api/users/:user_id", updateUserHandler);
    app.delete("/api/users/:user_id", deleteUserHandler);
    app.get("/api/users/wallet/:wallet_id", getUsersHandler);

    app.post("/api/avatars", createAvatarHandler);
    app.delete("/api/avatars/:avatar_id", deleteAvatarHandler);
    app.get("/api/avatars", getAvatarsHandler);
    app.get("/api/avatars/:avatar_id", getAvatarsHandler);
    app.put("/api/avatars/:avatar_id", updateAvatarHandler);

    app.get("/alive", (req: Request, res: Response) => {
        res.status(200).send("ok");
    })

}