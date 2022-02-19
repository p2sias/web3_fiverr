import { Express, Request, Response } from "express";
import { createUserHandler, getUsersHandler, updateUserHandler, deleteUserHandler } from "./controller/user.controller";

export default function (app: Express) {  
    app.post("/api/users", createUserHandler);
    app.get("/api/users", getUsersHandler);
    app.get("/api/users/:user_id", getUsersHandler);
    app.put("/api/users/:user_id", updateUserHandler);
    app.delete("/api/users/:user_id", deleteUserHandler);

    app.get("/alive", (req: Request, res: Response) => {
        res.status(200).send("ok");
    })

}