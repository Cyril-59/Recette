import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Produit } from '../model/produit';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProduitService {

  constructor(public http: HttpClient) {
  }

  getProduits(): Observable<Produit[]> {
    return this.http.get<Produit[]>('https://qqm-back.herokuapp.com/api/produits');
  }

  createProduit(produit: Produit): Observable<Produit> {
    return this.http.post<Produit>('https://qqm-back.herokuapp.com/api/produits', produit);
  }

  updateProduit(produit: Produit): Observable<Produit> {
    return this.http.put<Produit>('https://qqm-back.herokuapp.com/api/produits/'+ produit.id , produit);
  }

  deleteProduit(id: number): Observable<Produit> {
    return this.http.delete<Produit>('https://qqm-back.herokuapp.com/api/produits/'+ id );
  }
}
