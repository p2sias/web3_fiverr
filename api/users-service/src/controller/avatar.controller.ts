import { Request, Response } from "express";
import { createAvatar, getAvatars, deleteAvatar, findAvatar, findAndUpdateAvatar  } from "../service/avatar.service";
import { findUser, findAndUpdateUser, getUsers } from "../service/user.service";
import log from "../logger";
import { get } from "lodash";

export async function createAvatarHandler(req: Request, res: Response) {
  try {
    const avatar = await createAvatar(req.body);

    const user = await findUser({ _id: avatar.user });

    if (!user)
    {
      log.error(`User ${avatar.user} not found !`);
      return res.sendStatus(404);
    }

    user.avatar = avatar._id;

    await findAndUpdateUser({ _id: user._id }, user, { new: true })
      .then(() => log.info(`New image (${avatar._id}) added to user (${user._id})`));


    return res.status(200).send(avatar.toJSON());
  } catch (e: any) {
    log.error(e);
    return res.status(409).send(e.message);
  }
}

export async function updateAvatarHandler(req: Request, res: Response) {
  const { params } = req;

  if (!params.avatar_id) return res.sendStatus(400);
  
  const update = {avatar: req.body.avatar.data};

  const avatar = await findAvatar({ _id: params.avatar_id});

  if (!avatar) {
    return res.sendStatus(404);
  }

  const updatedAvatar = await findAndUpdateAvatar({ _id: params.avatar_id }, update, { new: true });

  return res.status(200).send(updatedAvatar);
}

export async function getAvatarsHandler(req: Request, res: Response) {
  try {

    let query = {};
    const { params } = req;

    if (params && params.avatar_id) query = { _id: params.avatar_id };

    const avatars = await getAvatars(query);

    if (avatars) {
      return res.status(200).send(avatars);
    }
  } catch (e: any) {
    log.error(e);
    return res.status(409).send(e.message);
  }
}

export async function deleteAvatarHandler(req: Request, res: Response) {
  const { params } = req;

  if(!params.avatar_id)  return res.sendStatus(400);

  let avatar = await findAvatar({ _id: params.avatar_id });

  if (!avatar) {
    return res.sendStatus(404);
  }

  let user = await findUser({ _id: avatar.user });

  if (user)
  {
    user.avatar = null;
    await findAndUpdateUser({ _id: user._id }, user, { new: true });
  }

  await deleteAvatar({ _id: params.avatar_id });

  return res.sendStatus(200);
}

