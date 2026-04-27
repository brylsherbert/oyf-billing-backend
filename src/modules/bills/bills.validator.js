import { z } from "zod";

export const createUserBillSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters long" }),
  amount: z.coerce
    .number()
    .int({ message: "Amount must be an integer" })
    .min(1, { message: "Amount must be at least 1" }),
  due_date: z.coerce.date({ message: "Due date must be a valid date" }),
  status: z.enum(["unpaid", "pending", "paid", "overdue", "failed", "refunded"], { message: "Status must be a valid status" }),
});

export const updateUserBillSchema = z.object({
  title: z
    .string({ message: "Title is required" })
    .min(3, { message: "Title must be at least 3 characters long" }),
  amount: z.coerce
    .number({ message: "Amount is required and must be a number" })
    .int({ message: "Amount must be an integer" })
    .min(1, { message: "Amount must be at least 1" }),
  due_date: z.coerce.date({ message: "Due date must be a valid date" }),
  status: z.enum(["unpaid", "pending", "paid", "overdue", "failed", "refunded"], { message: "Status must be a valid status" }),
});
