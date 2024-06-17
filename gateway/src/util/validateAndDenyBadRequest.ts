import { Request, Response } from "express";
import { AnyZodObject, ZodError, z } from "zod";

// Это могло быть middleware
export function validateAndDenyBadRequest<T extends AnyZodObject> (req: Request, res: Response, z: T): z.infer<T> | undefined {
    try {
        return z.parse(req.body)
    } catch (e: any) {
        res.statusCode = 400;
        if (e.message) {
            res.send({message: e.messsage})
        }
        else if (e instanceof ZodError) {
            res.send({message: 'Zod parse failed', zodIssues: e.issues.map( issue => issue.message )})
        }
        else {
            res.send(JSON.stringify(e)); // Не пробуем дальше. Можно подумать сильнее
        }
    }
}