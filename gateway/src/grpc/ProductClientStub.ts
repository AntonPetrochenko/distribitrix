import { ChannelCredentials, Metadata } from "@grpc/grpc-js";
import { Claim, Credentials, TokenPair, UserClient, UserInfo } from "./generated/auth";
import { UnaryCallback } from "@grpc/grpc-js/build/src/client";
import { tokenToMetadata } from "../util/tokenToMetadata";
import { ListingRequest, ProductClient, ProductCreationData, ProductCreationSet, ProductData, ProductRequest, ProductSet, Status } from "./generated/products";

import { z } from 'zod'
import schema from '../zod/schema'


const productClient = new ProductClient(process.env.STORE_ADDRESS ?? '', ChannelCredentials.createInsecure(), {})

// используем z.infer чтобы сэкономить время на написании и отслеживании изменений интерфейса
type LocalProductCreationData = z.infer<typeof schema.ProductCreationSchema>
type LocalProductData = z.infer<typeof schema.ProductSchema>

export class ProductClientStub {
    create(authToken: string, product: LocalProductCreationData, cb: UnaryCallback<Status>) { 
        // Когда нибудь может появиться специфика для этих операций. А пока пускаем их в одно русло
        this.bulkCreate(authToken, [product], cb)
    }

    bulkCreate(authToken: string, products: LocalProductCreationData[], cb: UnaryCallback<Status>) {
        productClient.CreateProducts(new ProductCreationSet({
            products: products.map( product => new ProductCreationData(product) )
        }), tokenToMetadata({auth: authToken}), cb)
    }

    update(authToken: string, product: LocalProductData, cb: UnaryCallback<Status>) {
        productClient.UpdateProduct(new ProductData(product), tokenToMetadata({auth: authToken}), cb)
    }

    getListing(authToken: string, pageNumber: number, perPage: number, cb: UnaryCallback<ProductSet>) {
        productClient.GetListing( new ListingRequest({pageNumber, perPage}), tokenToMetadata({auth: authToken}), cb)
    }

    getProduct(authToken: string, id: number, cb: UnaryCallback<ProductData>) {
        productClient.GetProduct( new ProductRequest({id}), tokenToMetadata({auth: authToken}), cb)
    }
}