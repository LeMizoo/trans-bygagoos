import { IsString, Length, Matches } from 'class-validator';

export class LoginByCodeDto {
  @IsString()
  @Matches(/^BYG-(CH|LV)[0-9]{3}$/, {
    message: 'Format de code d\'accès invalide. Format attendu: BYG-CH001 ou BYG-LV001'
  })
  codeAcces: string;

  @IsString()
  @Length(4, 6, { message: 'Le PIN doit contenir entre 4 et 6 caractères' })
  @Matches(/^[0-9]+$/, { message: 'Le PIN doit contenir uniquement des chiffres' })
  pin: string;
}
