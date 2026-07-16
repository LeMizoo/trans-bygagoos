import { IsEmail, IsNotEmpty, MinLength, IsString, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Email invalide' })
  email: string;

  @IsNotEmpty()
  @MinLength(6, { message: 'Le mot de passe doit faire au moins 6 caractères' })
  password: string;

  @IsNotEmpty()
  @IsString()
  nom: string;

  @IsOptional()
  @IsString()
  telephone?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  coopId?: string;
}
