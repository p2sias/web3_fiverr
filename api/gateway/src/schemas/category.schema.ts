import { object, string, bool} from "yup";

export const createCategorySchema = object({
  body: object({
    name: string().required("Name is required")
  }),
});