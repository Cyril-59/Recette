import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Recette } from '../model/recette';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface MenuSelectionHistoryItem {
  id: number;
  createdAt: string;
  coursesText?: string;
  stockJson?: string;
  autresJson?: string;
  doneRecipeIds?: number[];
  recettes: Recette[];
}

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

  getHistory(): Observable<MenuSelectionHistoryItem[]> {
    return this.http.get<MenuSelectionHistoryItem[]>(`${this.apiUrl}/history`);
  }

  saveSelection(recetteIds: number[], coursesText?: string, stockJson?: string, autresJson?: string): Observable<Recette[]> {
    return this.http.post<Recette[]>(this.apiUrl, { recetteIds, coursesText, stockJson, autresJson });
  }

  toggleRecipeDone(menuId: number, recetteId: number): Observable<MenuSelectionHistoryItem> {
    return this.http.patch<MenuSelectionHistoryItem>(`${this.apiUrl}/${menuId}/done/${recetteId}`, {});
  }

  clearSelection(): Observable<void> {
    return this.http.delete<void>(this.apiUrl);
  }
}
