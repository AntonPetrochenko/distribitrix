import { ServiceError } from "@grpc/grpc-js";
import { Response } from "express";

export function handleServiceFailure(err: ServiceError, res: Response) {
    res.statusCode = 500
    res.send({...err})
}