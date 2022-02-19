import { object, string} from "yup";

export const createUserSchema = object({
  body: object({
    polygon_address: string().required("Polygon address is required"),
    mail: string().required("Mail is required"),
    pseudo: string().required("Pseudo is required")
  }),
});