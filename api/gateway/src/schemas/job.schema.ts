import { object, string, number} from "yup";

export const createJobSchema = object({
  body: object({
    title: string().required("Ttile is required"),
    about: string().required("About section is required"),
    user: string().required("User is required"),
    category: string().required("Category is required")
  }),
});

export const updateJobSchema = object({
  body: object({
    title: string(),
    about: string(),
    user: string(),
    category: string()
  }),
});