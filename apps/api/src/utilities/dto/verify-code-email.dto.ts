import { IsEmail, IsString, Length } from 'class-validator';

export class VerifyCodeEmailDto {
  @IsEmail()
  email!: string;

  @IsString()
  @Length(1, 32)
  code!: string;
}
