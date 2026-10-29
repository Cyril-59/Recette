import { Component, OnInit, HostListener, AfterViewInit } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { Recette } from '../model/recette';
import { Ingredient } from '../model/ingredient';
import { MenuService, MenuSelectionHistoryItem } from '../services/menu.service';

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
  ingredientsStock: Ingredient[] = [];
  ingredientsAutres: Ingredient[] = [];
  text: string = 'Vide';
  index: number = 0;
  innerWidth: number;

  showMenuPreview = false;
  selectedRecipeDetail: Recette = null;

  menuHistory: MenuSelectionHistoryItem[] = [];
  activeHistoryIndex = 0;

  constructor(private menuService: MenuService) { }

  ngOnInit(): void {
    try {
      const savedText = localStorage.getItem('recette_courses_text');
      if (savedText) {
        this.text = savedText;
      }
      const savedStock = localStorage.getItem('recette_courses_stock');
      if (savedStock) {
        this.ingredientsStock = JSON.parse(savedStock);
      }
      const savedAutres = localStorage.getItem('recette_courses_autres');
      if (savedAutres) {
        this.ingredientsAutres = JSON.parse(savedAutres);
      }
    } catch (e) {}

    this.loadMenuHistory();
  }

  loadMenuHistory(): void {
    this.menuService.getHistory().subscribe((history) => {
      this.menuHistory = history || [];
      if (this.menuHistory.length > 0) {
        const latest = this.menuHistory[0];
        if (latest.recettes) {
          this.recettesCourses = latest.recettes;
        }
        if (latest.coursesText) {
          this.text = latest.coursesText;
          try {
            localStorage.setItem('recette_courses_text', this.text);
          } catch (e) {}
        }
        if (latest.stockJson) {
          try {
            this.ingredientsStock = JSON.parse(latest.stockJson);
            localStorage.setItem('recette_courses_stock', latest.stockJson);
          } catch (e) {}
        }
        if (latest.autresJson) {
          try {
            this.ingredientsAutres = JSON.parse(latest.autresJson);
            localStorage.setItem('recette_courses_autres', latest.autresJson);
          } catch (e) {}
        }
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

  setCourses(event: any) {
    if (typeof event === 'string') {
      this.text = event;
    } else if (event) {
      this.text = event.text;
      this.ingredientsStock = event.stock || [];
      this.ingredientsAutres = event.autres || [];
    }
    this.index = 1;
  }
}
