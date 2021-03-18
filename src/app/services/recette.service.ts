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
    return this.http.get<Recette[]>('https://qqm-back.herokuapp.com/api/recettes');
  }

  createRecette(recette: Recette): Observable<Recette> {
    return this.http.post<Recette>('https://qqm-back.herokuapp.com/api/recettes', recette);
  }

  updateRecette(recette: Recette): Observable<Recette> {
    return this.http.put<Recette>('https://qqm-back.herokuapp.com/api/recettes/'+ recette.id , recette);
  }

  deleteRecette(id: number): Observable<Recette> {
    return this.http.delete<Recette>('https://qqm-back.herokuapp.com/api/recettes/'+ id);
  }
}
