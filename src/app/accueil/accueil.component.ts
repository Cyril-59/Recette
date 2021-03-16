import { Component, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ProduitService } from '../services/produit.service';
import { Produit } from '../model/produit';
import { SelectItem } from 'primeng/api/selectitem';
import { Recette } from '../model/recette';

@Component({
  selector: 'app-accueil',
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.css']
})
export class AccueilComponent implements OnInit {
  produitReady = false;
  recetteReady = false;
  recettes: Recette[];
  produits: SelectItem[];

  constructor() { }

  ngOnInit(): void {
  }

  setProduits(produits) {
    this.produitReady = true;
    this.produits = produits.map((p) => {
      return {"value": p, "label": p.label}
    });
  }

  setRecettes(recettes) {
    this.recetteReady = true;
    this.recettes = recettes;
  }
}
