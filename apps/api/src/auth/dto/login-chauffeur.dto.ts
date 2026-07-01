import { IsString, MinLength, IsOptional } from 'class-validator';

export class LoginChauffeurDto {
  @IsString()
  codeAcces: string;

  @IsString()
  @MinLength(4)
  pin: string;

  @IsOptional()
  @IsString()
  flotteId?: string;
}
