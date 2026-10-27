import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { FacialCompareResult } from '../interfaces/facial';

@Injectable({
  providedIn: 'root',
})
export class FacialService {
  private readonly http = inject(HttpClient);

  compareImages(images: string[]) {
    return this.http.post<FacialCompareResult>(`${environment.apiUrl}/facial/compare`, {
      imgs_base64: images,
    });
  }
}
