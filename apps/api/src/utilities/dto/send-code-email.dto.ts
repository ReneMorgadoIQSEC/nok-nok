import { IsEmail } from 'class-validator';

export class SendCodeEmailDto {
  @IsEmail()
  email!: string;
}
