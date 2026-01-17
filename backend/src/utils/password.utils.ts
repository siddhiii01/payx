import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

//HASH PLAIN PASSWORD 
export const hashPassword = async (plainPassword: string): Promise<string> => {
    return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

//compare plain password with hash password
export const comparePassword = async (plainPassword: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(plainPassword, hash);
}