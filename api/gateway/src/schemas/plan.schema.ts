import { object, string, number} from "yup";

export const createPlanSchema = object({
  body: object({
    type: string().equals(['Basic', 'Standard', 'Premium'],
      "Type must be Basic, Standard or Premium")
      .required("Type required !"),
    
    price: number().required("price required"),
    plan_title: string().required("Title required"),
    plan_desc: string().required("Description required"),
    max_delivery_days: string().required("Max delivery days required")
  }),
});