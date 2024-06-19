import { ChannelCredentials, Metadata } from "@grpc/grpc-js";
import { UnaryCallback } from "@grpc/grpc-js/build/src/client";
import { tokenToMetadata } from "../util/tokenToMetadata";
import { ListingRequest, ProductClient, ProductCreationData, ProductCreationSet, ProductData, ProductRequest, ProductSet, Status } from "./generated/products";

import { date, z } from 'zod'
import schema from '../zod/schema'

const productClient = new ProductClient(process.env.STORE_ADDRESS ?? '', ChannelCredentials.createInsecure(), {})

// используем z.infer чтобы сэкономить время на написании и отслеживании изменений интерфейса
type LocalProductCreationData = z.infer<typeof schema.ProductCreationSchema>
type LocalProductData = z.infer<typeof schema.ProductSchema>

export class ProductClientImpl {
    create(product: LocalProductCreationData, cb: UnaryCallback<Status>) { 
        // Когда нибудь может появиться специфика для этих операций. А пока пускаем их в одно русло
        this.bulkCreate([product], cb)
    }

    bulkCreate(products: LocalProductCreationData[], cb: UnaryCallback<Status>) {
        console.log('Creating shit', products)
        productClient.CreateProducts(new ProductCreationSet({
            products: products.map( product => new ProductCreationData({
                data: product.data,
                enabled: product.enabled,
                name: product.name
            }) )
        }), cb)
    }

    update(product: LocalProductData, cb: UnaryCallback<Status>) {
        productClient.UpdateProduct(new ProductData(product), cb)
    }

    getListing(pageNumber: number, perPage: number, includeDisabled: boolean, cb: UnaryCallback<ProductSet>) {
        productClient.GetListing( new ListingRequest({pageNumber, perPage, includeDisabled}), cb)
    }

    getProduct(id: number, allowDisabled: boolean, cb: UnaryCallback<ProductData>) {
        productClient.GetProduct( new ProductRequest({id, allowDisabled}), cb)
    }
}