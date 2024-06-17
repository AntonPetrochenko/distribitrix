import { Response, Router } from "express";
import { ProductClientStub } from "../grpc/ProductClientStub";
import { z } from "zod";
import schema from "../zod/schema";
import { handleServiceFailure } from "../util/handleServiceFailure";
import { Status } from "../grpc/generated/products";
import { UnaryCallback } from "@grpc/grpc-js/build/src/client";
import { Message } from "google-protobuf";
import { ServiceError } from "@grpc/grpc-js";
import { COOKIE_TOKEN_AUTH } from "../util/constants";
import { validateAndDenyBadRequest } from "../util/validateAndDenyBadRequest";
export const ProductsRouter = Router()

// На протяжении всего этого файла я вытаскиваю куки вручную, и в принципе много чего здесь делаю в паскально-процедуральном стиле
// Это вредные привычки, которые нужно исправить, но в этих временных рамках мне проще писать так, как умею.
// Я пишу в таком стиле для того, чтобы мои джуны наглядно видели, что откуда растёт, и какой нибудь Вася за бутерброд
// 100% смог перенять мой код. Такой была моя работа последние 3 года.

const productClient = new ProductClientStub()

function handleProductRejection(status: Status, res: Response) {
    res.status(400).send({ // TODO: К сожалению, мы не обрабатываем 404 :(
        message: status.message
    })
}

function productStatusResponseHandler(err: ServiceError | null, data: Status | undefined, res: Response) {
    if (err) {
        handleServiceFailure(err, res)
    } else {
        if ( data && !data.ok ) {
            handleProductRejection(data, res)
        }
        if ( data ) {
            res.status(201).send({...data})
        }
    }
}

ProductsRouter.post('/', (req, res) => {
    // Тут вадилация чуть умнее. В остальных случаях используем стандартный обработчик
    // Реализуем оба. Как сказано в стабе, когда нибудь может появиться разница, хоть сейчас её и нет
    const singleProduct = schema.ProductCreationSchema.safeParse(req.body)
    if (singleProduct.success) {
        productClient.create(req.cookies[COOKIE_TOKEN_AUTH] ?? '', singleProduct.data, (err, data) => {
            productStatusResponseHandler(err, data, res)
        })
    }

    const bulkProducts = schema.BulkProductCreationSchema.safeParse(req.body)
    if (bulkProducts.success) {
        productClient.bulkCreate(req.cookies[COOKIE_TOKEN_AUTH] ?? '', bulkProducts.data, (err, data) => {
            productStatusResponseHandler(err, data, res)
        })
    }

    if (! (singleProduct.success || bulkProducts.success) ) {
        res.status(400).send({message: "Couldn't handle post data as either available format"})
    }
})

ProductsRouter.get('/:id', (req, res) => {
    productClient.getProduct(req.cookies[COOKIE_TOKEN_AUTH] ?? '', parseInt(req.params.id), (err, data) => {
        if (err) {
            handleServiceFailure(err, res)
        } else if (data) {
            res.status(200).send({...data})
        }
    })
})

ProductsRouter.put('/', (req, res) => {
    const product = validateAndDenyBadRequest(req, res, schema.ProductSchema)
    if (product) {
        productClient.update(req.cookies[COOKIE_TOKEN_AUTH] ?? '', product, (err, data) => {
            productStatusResponseHandler(err, data, res)
        })
    }
})

ProductsRouter.get('/listing', (req, res) => {
    const listingRequest = validateAndDenyBadRequest(req, res, schema.ListingRequestSchema)
    if (listingRequest) {
        productClient.getListing(req.cookies[COOKIE_TOKEN_AUTH] ?? '', listingRequest.pageNumber, listingRequest.perPage, (err, data) => {
            if (err) {
                handleServiceFailure(err, res)
            } else if (data) {
                res.status(200).send({...data})
            }
        })
    }
})