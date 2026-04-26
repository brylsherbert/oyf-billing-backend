import { generateToken } from "../../utils/generate-token.js";
import { v7 as uuidv7 } from "uuid";
import * as authRepo from './auth.repository.js';
import { hash, genSalt, compare} from "bcrypt";

export const createUser = async (data, res) =>
{
    const existingUser = await authRepo.findUserByEmail(data.email);
    if (existingUser) {
        const error = new Error('Email already exists');
        error.status = 400;
        throw error;
    }

    const { username, email, password: bodyPassword } = data;
    
    const salt = await genSalt(10);
    const hashedPassword = await hash(bodyPassword, salt); 

    const user = {
        id: uuidv7(),
        email: email,
        username: username,
        password: hashedPassword,
    };

    // Generate Token
    const token = generateToken(user.id, res);
    const { password, ...userWithOutPassword } = await authRepo.insertUserToDB(user);

    return { user: userWithOutPassword, token};
}

export const loginUser = async (data, res) =>
{
    const existingUser = await authRepo.findUserByEmail(data.email);
    if (!existingUser) {
        const error = new Error("User does not exist. Please try again.");
        error.status = 400;
        throw error;
    }

    const isPasswordValid = await compare(data.password, existingUser.password);
    if (!isPasswordValid) {
        const error = new Error("Invalid username or password");
        error.status = 400;
        throw error;
    }

    // If password is valid return user and token
    const { password, ...existingUserWithOutPassword } = existingUser;

    // Generate Token
    const token = generateToken(existingUser.id, res);

    return { user: existingUserWithOutPassword, token };
};