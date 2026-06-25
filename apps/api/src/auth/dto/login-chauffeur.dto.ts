import { IsString, MinLength } from 'class-validator';

export class LoginChauffeurDto {
  @IsString()
  codeAcces: string;

  @IsString()
  @MinLength(4)
  pin: string;
}
