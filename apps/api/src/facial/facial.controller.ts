import { BadRequestException, Body, Controller, HttpCode, Post } from '@nestjs/common';
import { FacialService } from './facial.service';

const MAX_IMAGES = 10;

@Controller('facial')
export class FacialController {
  constructor(private readonly facialService: FacialService) {}

  @Post('compare')
  @HttpCode(200)
  compare(@Body() body: { imgs_base64?: unknown }) {
    return this.facialService.compareImages(this.requireImages(body?.imgs_base64));
  }

  private requireImages(value: unknown): string[] {
    if (!Array.isArray(value) || value.length === 0 || value.length > MAX_IMAGES) {
      throw new BadRequestException('Se necesitan las imágenes de la prueba de vida');
    }

    return value.map((image) => {
      if (typeof image !== 'string' || !image.trim()) {
        throw new BadRequestException('Se necesitan las imágenes de la prueba de vida');
      }
      return image.trim();
    });
  }
}
