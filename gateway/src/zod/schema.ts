import { coerce, z } from "zod";

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

const ListingRequestSchema = z.object({
    pageNumber: z.number({coerce: true}),
    perPage: z.number({coerce: true})
})

const RefreshClaimSchema = z.object({
    login: z.string()
})

const ProductCreationSchema = ProductSchema.omit({id: true})

const BulkProductCreationSchema = z.array(ProductCreationSchema)

export default { RefreshClaimSchema, AuthSchema, ProductSchema, UserSchema, ProductCreationSchema, BulkProductCreationSchema, ListingRequestSchema }