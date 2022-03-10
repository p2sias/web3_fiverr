import { Request, Response } from "express";
import { createUser, findUser, findAndUpdateUser, getUsers, deleteUser } from "../service/user.service";
import {findAvatar, deleteAvatar } from "../service/avatar.service";
import { generateToken } from "../service/session.service";
import log from "../logger";
import { get } from "lodash";

export async function createUserHandler(req: Request, res: Response) {
  try {
    let user = await createUser(req.body);
    let token = await generateToken(user)
    user = await findAndUpdateUser({ _id: user._id }, { jwt_token: token }, { new: true }) as any;
    
    if (user) {
      return res.send(user.toJSON());
    }
  } catch (e: any) {
    log.error(e);
    return res.status(409).send(e.message);
  }
}

export async function updateUserHandler(req: Request, res: Response) {
  const { params } = req;

  if (!params.user_id) return res.sendStatus(400);
  
  const update = req.body;

  const user = await findUser({ _id: params.user_id});

  if (!user) {
    return res.sendStatus(404);
  }

  const updatedUser = await findAndUpdateUser({ _id: params.user_id }, update, { new: true });

  return res.send(updatedUser);
}

export async function getUsersHandler(req: Request, res: Response) {
  try {
    const users = await getUsers({});

    if (users) {
      return res.send(users);
    }
  } catch (e: any) {
    log.error(e);
    return res.status(409).send(e.message);
  }
}

export async function deleteUserHandler(req: Request, res: Response) {
  const { params } = req;

  if(!params.user_id)  return res.sendStatus(400);

  let user = await findUser({ _id: params.user_id });

  if (!user) {
    return res.sendStatus(404);
  }

  if (user.avatar)
  {
    let avatar = await findAvatar({ _id: user.avatar })
    
    if (avatar) {
      await deleteAvatar(avatar)
    }
  }

  await deleteUser({ _id: params.user_id });

  return res.sendStatus(200);
}
