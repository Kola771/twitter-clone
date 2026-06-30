import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Koladé Aboudou' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'kola_dev' })
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9_]+$/, { message: 'Lettres, chiffres et _ uniquement' })
  username: string;

  @ApiProperty({ example: 'kola@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password1' })
  @IsString()
  @MinLength(8)
  @Matches(/[A-Z]/, { message: 'Au moins une majuscule' })
  @Matches(/[0-9]/, { message: 'Au moins un chiffre' })
  password: string;
}
