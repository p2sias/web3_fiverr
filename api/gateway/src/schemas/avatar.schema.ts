import { object, string} from "yup";

export const createPictureSchema = object({
  body: object({
    avatar: string().required("Image buffer is required !"),
    user: string().required("Job is required")
  }),
});


