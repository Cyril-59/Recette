import { Component, OnInit, HostListener, AfterViewInit } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { Recette } from '../model/recette';
import { MenuService } from '../services/menu.service';

@Component({
  selector: 'app-accueil',
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.css']
})
export class AccueilComponent implements OnInit, AfterViewInit {
  produitReady = false;
  recetteReady = false;
  recettes: Recette[];
  produits: SelectItem[];
  recettesCourses: Recette[] = [];
  text: string = 'Vide';
  index: number = 0;
  innerWidth: number;

  showMenuPreview = false;
  selectedRecipeDetail: Recette = null;

  constructor(private menuService: MenuService) { }

  ngOnInit(): void {
    this.menuService.getLatestSelection().subscribe((saved) => {
      if (saved && saved.length > 0) {
        const unique: Recette[] = [];
        const seen = new Set<number>();
        for (const r of saved) {
          if (r && r.id && !seen.has(r.id)) {
            seen.add(r.id);
            unique.push(r);
          }
        }
        this.recettesCourses = unique;
      }
    });
  }

  ngAfterViewInit(): void {
    this.innerWidth = window.innerWidth;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.innerWidth = window.innerWidth;
  }

  openMenuPreview() {
    this.selectedRecipeDetail = null;
    this.showMenuPreview = true;
  }

  selectRecipeDetail(recipe: Recette) {
    this.selectedRecipeDetail = recipe;
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

  setText(text) {
    this.text = text;
    this.index = 1;
  }
}
