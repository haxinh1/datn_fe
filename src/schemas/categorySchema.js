import { z } from "zod";

const categorySchema = z.object({
  name: z
    .string()
    .min(1, { message: "Tên danh mục không được để trống" })
    .min(3, { message: "Tên danh mục ít nhất 3 ký tự " })
    .max(100, { message: "Tên danh mục không được vượt quá 100 ký tự" }),
  parentId: z
    .string()
    .optional()
    .nullable()
    .refine((val) => val === "" || val !== null, {
      message: "Chọn một danh mục cha nếu muốn.",
    }),
});
export default categorySchema;