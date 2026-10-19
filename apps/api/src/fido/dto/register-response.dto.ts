import { IsEmail, IsObject } from 'class-validator';

export class RegisterResponseDto {
  @IsEmail()
  email!: string;

  @IsObject()
  attestation!: Record<string, unknown>;
}
