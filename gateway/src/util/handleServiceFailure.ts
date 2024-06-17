import { ServiceError } from "@grpc/grpc-js";
import { Response } from "express";

export function handleServiceFailure(err: ServiceError, res: Response, status?: number) {
    res.statusCode = status ?? 500
    res.send({...err})
}