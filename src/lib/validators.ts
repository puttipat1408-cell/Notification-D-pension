import { z } from "zod";

import { dashboardStatusValues } from "@/lib/statuses";

export const createRequestSchema = z.object({
  requestCount: z.coerce.number().int("จำนวนต้องเป็นเลขจำนวนเต็ม").min(1, "กรุณาระบุจำนวนผู้ขออย่างน้อย 1 ราย"),
  agency: z.string().trim().min(1, "กรุณาเลือกส่วนราชการ"),
});

export const updateRequestStatusSchema = z.object({
  status: z.enum(dashboardStatusValues),
  note: z.string().trim().max(500, "หมายเหตุต้องไม่เกิน 500 ตัวอักษร").optional(),
  sendNotification: z.boolean().optional(),
});
