import { prisma } from "../../lib/prisma";
import bcrypt from "bcrypt";
import config from "../../config";
import { RegisterUserPayload } from "./user.interface";

const registerUserIntoDB = async (payload: RegisterUserPayload) => {
    const {email, name, password, profilePhoto} = payload;
    const isUserExists = await prisma.user.findUnique({
        where: {email},
    });

    if (isUserExists) {
        throw new Error("User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, Number(config.bcrypt_salt_rounds));

    const user = await prisma.user.create({
        data: {
            email,
            name,
            password: hashedPassword,
            profile: {
                create: {
                    profilePhoto,
                }
            }
        },
    });

    // await prisma.profile.create({
    //     data: {
    //         userId: user.id,
    //         profilePhoto
    //     },      
    // });

    const userSend = await prisma.user.findUnique({
        where: {
            id: user.id,
            email: user.email || email, 
        },
        omit: {
            password: true,
        },
        include: {
            profile: true,
        }
    });

    return userSend;
}

const getMyProfileFromDB = async (userId: string) => {
    const user = await prisma.user.findUniqueOrThrow({
        where: {id: userId},
        omit: {
            password: true
        },
        include: {
            profile: true
        }
    })
    return user;
}

const updateMyProfileInDB = async (userId: string, payload: any) => {
    const {name, email, profilePhoto, bio} = payload;

    const updatedUser = await prisma.user.update({
        where: {
            id: userId
        },
        data: {
            name,
            email,
            profile: {
                update: {
                    profilePhoto,
                    bio
                }
            }
        },
        omit: {
            password: true
        },
        include: {
            profile: true
        }
    })

    return updatedUser;
}

export const userService = {
    registerUserIntoDB,
    getMyProfileFromDB,
    updateMyProfileInDB
}