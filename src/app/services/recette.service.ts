import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Recette } from '../model/recette';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RecetteService {

  private apiUrl = `${environment.apiUrl}/recettes`;

  constructor(public http: HttpClient) {
  }

  getRecettes(): Observable<Recette[]> {
    return this.http.get<Recette[]>(this.apiUrl);
  }

  createRecette(recette: Recette): Observable<Recette> {
    return this.http.post<Recette>(this.apiUrl, recette);
  }

  updateRecette(recette: Recette): Observable<Recette> {
    return this.http.put<Recette>(`${this.apiUrl}/${recette.id}`, recette);
  }

  deleteRecette(id: number): Observable<Recette> {
    return this.http.delete<Recette>(`${this.apiUrl}/${id}`);
  }
}
