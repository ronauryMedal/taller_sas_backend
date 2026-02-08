import { IsString, MinLength, MaxLength, IsEmail, IsNotEmpty } from "class-validator";

export class LoginDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;
    @IsString()
    @MinLength(6)
    @MaxLength(32)
    password: string;
}