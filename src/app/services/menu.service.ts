import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Recette } from '../model/recette';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  private apiUrl = `${environment.apiUrl}/menu`;

  constructor(public http: HttpClient) {
  }

  getLatestSelection(): Observable<Recette[]> {
    return this.http.get<Recette[]>(this.apiUrl);
  }

  saveSelection(recetteIds: number[]): Observable<Recette[]> {
    return this.http.post<Recette[]>(this.apiUrl, { recetteIds });
  }

  clearSelection(): Observable<void> {
    return this.http.delete<void>(this.apiUrl);
  }
}
