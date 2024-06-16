import { z } from "zod";

const AuthSchema = z.object({
    login: z.string(),
    password: z.string()
})

const UserSchema = z.object({
    login: z.string(),
    password: z.string(),
    admin: z.boolean()
})

const ProductSchema = z.object({
    id: z.number(),
    name: z.string(),
    data: z.string(),
    enabled: z.boolean()
})


export default { AuthSchema, ProductSchema, UserSchema }