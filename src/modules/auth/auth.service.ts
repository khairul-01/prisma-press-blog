import config from "../../config";
import { prisma } from "../../lib/prisma";
import { jwtUtils } from "../../utils/jwt";
import { ILoginUserPayload } from "./auth.interface";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";

const loginUser = async (payload: ILoginUserPayload) => {
    const { email, password } = payload;

    // const user = await prisma.user.findUnique({
    //     where: { email },
    // });

    // if (!user) {
    //     throw new Error("User not found");
    // }

    const user = await prisma.user.findUniqueOrThrow({
        where: { email },
    });

    if(user.activeStatus === "BLOCKED") {
        throw new Error("Your account has been blocked. Please contact support")
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) {
        throw new Error("Password is incorrect");
    }

    const payloadForToken = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    };      

//     const accessToken = jwt.sign(payloadForToken,config.jwt_access_secret,{
//         expiresIn: config.jwt_access_expires_in
//     } as SignOptions
// );

    const accessToken = jwtUtils.createToken(payloadForToken, config.jwt_access_secret, config.jwt_access_expires_in as SignOptions);

//     const refreshToken = jwt.sign(payloadForToken,config.jwt_refresh_secret,{
//         expiresIn: config.jwt_refresh_expires_in
//     } as SignOptions
// );

    const refreshToken = jwtUtils.createToken(payloadForToken, config.jwt_refresh_secret, config.jwt_refresh_expires_in as SignOptions);

    return { accessToken, refreshToken };
}

export const authService = {
    loginUser
};