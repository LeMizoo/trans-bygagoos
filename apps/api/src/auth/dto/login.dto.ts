import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Email invalide' })
  email: string;

  @IsNotEmpty({ message: 'Le mot de passe est obligatoire' })
  @MinLength(6, { message: 'Le mot de passe doit faire au moins 6 caractères' })
  password: string;
}
