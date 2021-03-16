import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Recette } from '../model/recette';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecetteService {

  constructor(public http: HttpClient) {
  }

  getRecettes(): Observable<Recette[]> {
    return this.http.get<Recette[]>('http://localhost:8080/api/recettes');
  }

  createRecette(recette: Recette): Observable<Recette> {
    return this.http.post<Recette>('http://localhost:8080/api/recettes', recette);
  }

  updateRecette(recette: Recette): Observable<Recette> {
    return this.http.put<Recette>('http://localhost:8080/api/recettes/'+ recette.id , recette);
  }

  deleteRecette(id: number): Observable<Recette> {
    return this.http.delete<Recette>('http://localhost:8080/api/recettes/'+ id);
  }
}
