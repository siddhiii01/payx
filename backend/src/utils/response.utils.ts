import { error, time, timeStamp } from "console";
import { Response } from "express";
import { fa } from "zod/locales";


//success response function
export const successResponse = (
    res: Response,
    data: any = null,
    message: string = 'Success',
    statusCode: number = 200
): void => {
    res.status(statusCode).json({
        ok: true,
        message,
        data,
        timeStamp: new Date().toISOString()
    })
};

//error response function
export const errorResponse = (res: Response, message: string, statusCode: number=400):void  => {
    res.status(statusCode).json({
        ok: false,
        error: {
            message,
        },
        timeStamp: new Date().toISOString()
    })
};

//server error function
export const serverResponse = (res: Response, message: string= 'Internal server error', ): void => {
    res.status(500).json({
        ok: false,
        error: {
            message
        },
        timeStamp: new Date().toISOString()
    })
}

//unauthorised specific 
export const unauthorizedResponse = (res: Response, message: string = "Unauthorised"): void => {
    res.status(401).json({
        ok: false,
        error: {
            message
        },
        timeStamp: new Date().toISOString()
    })
}

//validation error 
export const validationResponse = (res: Response, errors: any, message: string = 'Validation failed'): void => {
    res.status(400).json({
        ok: false,
        error: {
            message,
            details: errors
        },
        timeStamp: new Date().toISOString()
    })
}
