import { z } from "zod";

const sellSchema = z.object({
  selldata: z.object({
    symbol: z.string(),
    quantity: z.number().positive(),
    sellPrice: z.number().positive(),
    orderId: z.string(),
  }),
});

export { sellSchema };