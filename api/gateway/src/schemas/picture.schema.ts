import { object, string} from "yup";

export const createPictureSchema = object({
  body: object({
    image: string().required("Image buffer is required !"),
    job: string().required("Job is required")
  }),
});