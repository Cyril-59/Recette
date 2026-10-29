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

  menuHistory: { id: number; createdAt: string; recettes: Recette[] }[] = [];
  activeHistoryIndex = 0;

  constructor(private menuService: MenuService) { }

  ngOnInit(): void {
    this.loadMenuHistory();
  }

  loadMenuHistory(): void {
    this.menuService.getHistory().subscribe((history) => {
      this.menuHistory = history || [];
      if (this.menuHistory.length > 0 && this.menuHistory[0].recettes) {
        this.recettesCourses = this.menuHistory[0].recettes;
      } else {
        this.recettesCourses = [];
      }
    });
  }

  getActiveRecipes(): Recette[] {
    if (!this.menuHistory || this.menuHistory.length === 0) {
      return this.recettesCourses || [];
    }
    const current = this.menuHistory[this.activeHistoryIndex];
    return current && current.recettes ? current.recettes : [];
  }

  openMenuPreview() {
    this.selectedRecipeDetail = null;
    this.activeHistoryIndex = 0;
    this.loadMenuHistory();
    this.showMenuPreview = true;
  }

  ngAfterViewInit(): void {
    this.innerWidth = window.innerWidth;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.innerWidth = window.innerWidth;
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
