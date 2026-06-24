import { Request, Response } from "express";
import HttpStatus from "http-status";
import { userService } from "./user.service";
import { stat } from "node:fs";

const registerUser = async (req : Request, res : Response) => {
    try {
        const payload = req.body;
    // console.log({email, name, password});

    const user = await userService.registerUserIntoDB(payload);

    res.status(HttpStatus.CREATED).json({
        success: true,
        statusCode: HttpStatus.CREATED,
        message: "User registered successfully",
        data: {
            user
        }
    });
    } catch (error) {
        console.log(error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: "An error occurred while registering the user",
            error: (error as Error).message,
        });
    }
}

export const userController = {
    registerUser,
}