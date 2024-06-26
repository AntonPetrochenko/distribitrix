import { Response, Router } from "express";
import { ProductClientImpl } from "../grpc/ProductClientImpl";
import { z } from "zod";
import schema from "../zod/schema";
import { handleServiceFailure } from "../util/handleServiceFailure";
import { Status } from "../grpc/generated/products";
import { UnaryCallback } from "@grpc/grpc-js/build/src/client";
import { Message } from "google-protobuf";
import { ServiceError } from "@grpc/grpc-js";
import { COOKIE_TOKEN_AUTH } from "../util/constants";
import { validateAndDenyBadRequest } from "../util/validateAndDenyBadRequest";
import { AuthClientImpl } from "../grpc/AuthClientImpl";
import { protectWithAuthService } from "../middleware/auth";
export const ProductsRouter = Router()

// На протяжении всего этого файла я вытаскиваю куки вручную, и в принципе много чего здесь делаю в паскально-процедуральном стиле
// Это вредные привычки, которые нужно исправить, но в этих временных рамках мне проще писать так, как умею.
// Я пишу в таком стиле для того, чтобы мои джуны наглядно видели, что откуда растёт, и какой нибудь Вася за бутерброд
// 100% смог перенять мой код. Такой была моя работа последние 3 года.

const productClient = new ProductClientImpl()
const authClient = new AuthClientImpl()

function handleProductRejection(status: Status, res: Response) {
    res.status(400).send({ // TODO: К сожалению, мы не обрабатываем 404 :(
        message: status.message
    })
}

function productStatusResponseHandler(err: ServiceError | null, data: Status | undefined, res: Response) {
    if (err) {
        console.log('We have an err')
        handleServiceFailure(err, res)
    } else {
        if ( data && !data.ok ) {
            console.log('We have a bad state')
            handleProductRejection(data, res)
        }
        if ( data ) {
            console.log('Ok')
            res.status(201).send(data.toObject())
        }
    }
}

ProductsRouter.post('/', protectWithAuthService, (req, res) => {
    // Тут вадилация чуть умнее. В остальных случаях используем стандартный обработчик
    // Реализуем оба. Как сказано в стабе, когда нибудь может появиться разница, хоть сейчас её и нет
    console.log('Using schema single!')
    const singleProduct = schema.ProductCreationSchema.safeParse(req.body)
    if (singleProduct.success) {
        console.log('Using schema single!')
        productClient.create(singleProduct.data, (err, data) => {
            productStatusResponseHandler(err, data, res)
        })
    }
    console.log('Trying schema bulk!')
    const bulkProducts = schema.BulkProductCreationSchema.safeParse(req.body)
    if (bulkProducts.success) {
        console.log('Using schema bulk!')
        productClient.bulkCreate(bulkProducts.data, (err, data) => {
            console.log('It is done', err)
            productStatusResponseHandler(err, data, res)
        })
    }

    if (! (singleProduct.success || bulkProducts.success) ) {
        res.status(400).send({message: "Couldn't handle post data as either available format"})
    }
})


console.log('Does anything work in here???')
ProductsRouter.get('/listing', protectWithAuthService, (req, res) => {
    const listingRequest = validateAndDenyBadRequest(req, res, schema.ListingRequestSchema, true)
    console.log(listingRequest)
    if (listingRequest) {

        authClient.isAdmin(req.cookies[COOKIE_TOKEN_AUTH] ?? '', (err, data) => {
            if (err) {
                handleServiceFailure(err, res)
            } else if (data) {
                productClient.getListing(listingRequest.pageNumber, listingRequest.perPage, data.isAdmin, (err, data) => {
                    if (err) {
                        handleServiceFailure(err, res)
                    } else if (data) {
                        res.status(200).send(data.toObject())
                    }
                })
            }
        })
        
    }
})

ProductsRouter.put('/', protectWithAuthService, (req, res) => { // это неправильный put. правильный должен был принимать id. но я уже не буду править это со стороны сервиса
    const product = validateAndDenyBadRequest(req, res, schema.ProductSchema)
    if (product) {
        productClient.update(product, (err, data) => {
            productStatusResponseHandler(err, data, res)
        })
    }
})

ProductsRouter.get('/:id', protectWithAuthService, (req, res) => {
    authClient.isAdmin(req.cookies[COOKIE_TOKEN_AUTH] ?? '', (err, data) => {
        if (err) {
            handleServiceFailure(err, res)
        } else if (data) {
            productClient.getProduct(parseInt(req.params.id), data.isAdmin, (err, data) => {
                if (err) {
                    handleServiceFailure(err, res)
                } else if (data) {
                    res.status(200).send(data.toObject())
                }
            })
        }
    })
})
