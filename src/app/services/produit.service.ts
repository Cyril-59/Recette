import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Produit } from '../model/produit';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProduitService {

  private apiUrl = `${environment.apiUrl}/produits`;

  constructor(public http: HttpClient) {
  }

  getProduits(): Observable<Produit[]> {
    return this.http.get<Produit[]>(this.apiUrl);
  }

  createProduit(produit: Produit): Observable<Produit> {
    return this.http.post<Produit>(this.apiUrl, produit);
  }

  updateProduit(produit: Produit): Observable<Produit> {
    return this.http.put<Produit>(`${this.apiUrl}/${produit.id}`, produit);
  }

  deleteProduit(id: number): Observable<Produit> {
    return this.http.delete<Produit>(`${this.apiUrl}/${id}`);
  }
}
