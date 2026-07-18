import { IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginByCodeDto {
  @ApiProperty({
    description: 'Code d\'accès unique du chauffeur/livreur',
    example: 'BYG-CH001',
    pattern: '^BYG-(CH|LV)[0-9]{3}$'
  })
  @IsString()
  @Matches(/^BYG-(CH|LV)[0-9]{3}$/, {
    message: 'Format de code d\'accès invalide. Format attendu: BYG-CH001 ou BYG-LV001'
  })
  codeAcces: string;

  @ApiProperty({
    description: 'PIN 4-6 chiffres',
    example: '1234',
    minLength: 4,
    maxLength: 6
  })
  @IsString()
  @Length(4, 6, { message: 'Le PIN doit contenir entre 4 et 6 caractères' })
  @Matches(/^[0-9]+$/, { message: 'Le PIN doit contenir uniquement des chiffres' })
  pin: string;
}
