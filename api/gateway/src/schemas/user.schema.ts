import { object, string} from "yup";

export const createUserSchema = object({
  body: object({
    polygon_address: string().required("Polygon address is required"),
    mail: string(),
    pseudo: string()
  }),
});