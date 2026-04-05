import * as z from "zod";

export const listingSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  price: z.coerce.number().positive(),
  type: z.enum(["sale", "rent"]),
  propertyType: z.enum(["apartment", "house"]),
  rooms: z.coerce.number().int().min(1),
  area: z.coerce.number().positive(),
  floor: z.coerce.number().int(),
  totalFloors: z.coerce.number().int(),
  phone: z.string().min(9),
  locationId: z.string().min(1),
  latitude: z.number(),
  longitude: z.number(),
  landmark: z.string().optional().nullable(),
  amenities: z.array(z.string()).optional(),
  metroInfo: z.string().optional().nullable(),
});

export const commentSchema = z.object({
  text: z.string().min(1).max(1000),
  listingId: z.string().min(1),
  parentId: z.string().optional().nullable(),
});
