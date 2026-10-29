import { Component, OnInit, Input, OnChanges, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { Recette } from '../model/recette';
import { Ingredient } from '../model/ingredient';
import { SelectItem, MessageService } from 'primeng/api';
import { MenuService } from '../services/menu.service';

@Component({
  selector: 'app-stocks',
  templateUrl: './stocks.component.html',
  styleUrls: ['./stocks.component.css']
})
export class StocksComponent implements OnInit, OnChanges {
  @Input() produits: SelectItem[];
  @Input() recettes: Recette[];
  @Input() innerWidth: number;
  @Input() recettesCourses: Recette[];
  ingredients: Ingredient[];
  ingredientsAutres: Ingredient[];
  recettesMatch: Recette[];
  autresRecettes: Recette[];
  recettesSaison: Recette[];
  selectedRecipes: Recette[];
  selectedMenuRecipes: Recette[] = [];
  optionsRecettesMatch: SelectItem[] = [];
  options: SelectItem[] = [];
  optionsSaisons: SelectItem[];
  courses: Map<string, Ingredient[]>;
  coursesText: string;

  seasonFilter: 'saison' | 'hors-saison' | null = 'saison';
  selectedFilterTags: Set<string> = new Set<string>();
  recipeSearchQuery: string = '';

  availableTags: string[] = ['Favori', 'Végé', 'Express', 'Batch cooking'];
  allTags: string[] = ['Favori', 'Végé', 'Express', 'Batch cooking'];
  selectedTag: string = null;
  instructionsDialog = false;
  recipeForInstructions: Recette = null;

  mois: string[] = []
  hiver = [1, 2, 3, 12]
  printemps = [3, 4, 5, 6]
  ete = [6, 7, 8 , 9]
  automne = [9, 10, 11, 12]
  @Output() onCourses = new EventEmitter<any>();

  constructor(public messageService: MessageService, private menuService: MenuService) { }

  ngOnInit(): void {
    const cemois = new Date().getMonth() + 1;
    if (this.hiver.includes(cemois)) {
      this.mois.push('hiver')
    }
    if (this.ete.includes(cemois)) {
      this.mois.push('ete')
    }
    if (this.printemps.includes(cemois)) {
      this.mois.push('printemps')
    }
    if (this.automne.includes(cemois)) {
      this.mois.push('automne')
    }
    this.initStock();
    this.initRecette();
    this.initIngredientsAutres();
  }

  initStock() {
    this.ingredients = [new Ingredient()];
  }

  initIngredientsAutres() {
    this.ingredientsAutres = [new Ingredient()];
  }

  initRecette() {
    this.selectedMenuRecipes = [];
    this.initRecetteSaison();
    this.initAutreRecette();
  }

  initRecetteSaison() {
    this.recettesSaison = [new Recette()];
  }

  initAutreRecette() {
    this.autresRecettes = [new Recette()];
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!!changes['recettes'] && !!changes['recettes'].currentValue) {
      this.optionsSaisons = this.recettes.filter(r => r.automne && this.mois.includes('automne') ||
        r.ete && this.mois.includes('ete') ||
        r.hiver && this.mois.includes('hiver') ||
        r.printemps && this.mois.includes('printemps')
      ).map((r) => {
        return {"value": r, "label": r.titre}
      });
      const tmp = this.recettes.map((r) => {
        return {"value": r, "label": r.titre}
      });
      tmp.forEach(o => {
        if (!this.optionsSaisons.map(o => o.value).includes(o.value)) {
          this.options.push(o)
        }
      });

      this.updateAvailableTags();
    }
  }

  updateAvailableTags() {
    const set = new Set(this.availableTags);
    if (this.recettes) {
      for (const r of this.recettes) {
        if (r.tags) {
          r.tags.forEach(t => set.add(t));
        }
      }
    }
    this.allTags = Array.from(set);
  }

  isRecipeDeSaison(r: Recette): boolean {
    if (!r) return false;
    return !!((r.automne && this.mois.includes('automne')) ||
              (r.ete && this.mois.includes('ete')) ||
              (r.hiver && this.mois.includes('hiver')) ||
              (r.printemps && this.mois.includes('printemps')));
  }

  setSeasonFilter(filter: 'saison' | 'hors-saison'): void {
    if (this.seasonFilter === filter) {
      this.seasonFilter = null;
    } else {
      this.seasonFilter = filter;
    }
  }

  toggleFilterTag(tag: string): void {
    if (this.selectedFilterTags.has(tag)) {
      this.selectedFilterTags.delete(tag);
    } else {
      this.selectedFilterTags.add(tag);
    }
  }

  isFilterTagActive(tag: string): boolean {
    return this.selectedFilterTags.has(tag);
  }

  getMatchingRecipes(): Recette[] {
    if (!this.recettes) return [];
    return this.recettes.filter(r => {
      // 1. Filtre de saisonnalité exclusif (si activé)
      if (this.seasonFilter) {
        const deSaison = this.isRecipeDeSaison(r);
        if (this.seasonFilter === 'saison' && !deSaison) return false;
        if (this.seasonFilter === 'hors-saison' && deSaison) return false;
      }

      // 2. Filtres par tags (ET logique : doit posséder TOUS les tags sélectionnés)
      if (this.selectedFilterTags.size > 0) {
        for (const t of this.selectedFilterTags) {
          if (!r.tags || !r.tags.includes(t)) {
            return false;
          }
        }
      }

      // 3. Recherche textuelle
      if (this.recipeSearchQuery && this.recipeSearchQuery.trim()) {
        const q = this.recipeSearchQuery.toLowerCase().trim();
        const matchTitre = r.titre && r.titre.toLowerCase().includes(q);
        const matchIng = r.stringIngredients && r.stringIngredients.toLowerCase().includes(q);
        if (!matchTitre && !matchIng) return false;
      }

      return true;
    });
  }

  getAllMenuRecipes(): Recette[] {
    const map = new Map<number | string, Recette>();
    const addAll = (list: Recette[]) => {
      if (list) {
        for (const r of list) {
          if (r && r.titre) {
            const key = r.id || r.titre;
            if (!map.has(key)) {
              map.set(key, r);
            }
          }
        }
      }
    };
    addAll(this.selectedMenuRecipes);
    addAll(this.recettesSaison);
    addAll(this.autresRecettes);
    addAll(this.selectedRecipes);
    return Array.from(map.values());
  }

  getAntiGaspiSuggestions(): { sourceRecipe: Recette; suggestedRecipe: Recette }[] {
    if (!this.recettes) return [];
    const currentMenu = this.getAllMenuRecipes();
    if (currentMenu.length === 0) return [];

    const menuIds = new Set(currentMenu.map(r => r.id));
    const suggestionsMap = new Map<number, { sourceRecipe: Recette; suggestedRecipe: Recette }>();

    for (const menuR of currentMenu) {
      const fullSource = this.recettes.find(r => r.id === menuR.id);
      const links = fullSource?.linkedRecettes || menuR.linkedRecettes;
      if (links && links.length > 0) {
        for (const lr of links) {
          if (!menuIds.has(lr.id) && !suggestionsMap.has(lr.id)) {
            const target = this.recettes.find(r => r.id === lr.id);
            if (target) {
              suggestionsMap.set(lr.id, { sourceRecipe: menuR, suggestedRecipe: target });
            }
          }
        }
      }
      // Check reciprocal links: any recipe in this.recettes that links to menuR
      for (const candidate of this.recettes) {
        if (!menuIds.has(candidate.id) && candidate.linkedRecettes && !suggestionsMap.has(candidate.id)) {
          if (candidate.linkedRecettes.some(l => l.id === menuR.id)) {
            suggestionsMap.set(candidate.id, { sourceRecipe: menuR, suggestedRecipe: candidate });
          }
        }
      }
    }

    return Array.from(suggestionsMap.values());
  }

  getMatchingRecipesByTag(): Recette[] {
    if (!this.selectedTag || !this.recettes) return [];
    return this.recettes.filter(r => r.tags && r.tags.includes(this.selectedTag));
  }

  isRecipeInMenu(recipe: Recette): boolean {
    if (!recipe || !recipe.id) return false;
    const inSelectedMenu = this.selectedMenuRecipes?.some(r => r.id === recipe.id);
    const inSelected = this.selectedRecipes?.some(r => r.id === recipe.id);
    return !!(inSelectedMenu || inSelected);
  }

  toggleRecipeInMenu(recipe: Recette) {
    if (!recipe || !recipe.id) return;
    if (this.isRecipeInMenu(recipe)) {
      const idx = this.selectedMenuRecipes.findIndex(r => r.id === recipe.id);
      if (idx > -1) {
        this.selectedMenuRecipes.splice(idx, 1);
      }
      if (this.selectedRecipes) {
        const idxStock = this.selectedRecipes.findIndex(r => r.id === recipe.id);
        if (idxStock > -1) this.selectedRecipes.splice(idxStock, 1);
      }
      this.messageService.add({severity:'info', summary:'Retirée du menu', detail: recipe.titre});
    } else {
      this.selectedMenuRecipes.push(recipe);
      this.messageService.add({severity:'success', summary:'Ajoutée au menu', detail: recipe.titre});
    }
  }

  viderMenu(): void {
    this.selectedMenuRecipes = [];
    this.selectedRecipes = [];
  }

  viewInstructions(recipe: Recette) {
    this.recipeForInstructions = recipe;
    this.instructionsDialog = true;
  }

  proposerRecettes() {
    if (this.ingredients.length > 0 && !!this.ingredients[0].produit) {
    this.recettesMatch = [];
    const matchValues = [];
      for (const recette of this.recettes) {
        let match = false;
        let matchValue = 0;
        for (const recetteIngredient of recette.ingredients) {
          for (const ingredient of this.ingredients) {
            if (recetteIngredient.produit.label === ingredient.produit.label) {
              match = true;
              matchValue++;
            }
          }
        }
        if (match) {
          if (matchValues.length === 0) {
            matchValues.push(matchValue);
            this.recettesMatch.push(recette);
          } else {
            let idx = 0;
            for (const value of matchValues) {
              if (matchValue >= value) {
                break;
              } else {
                idx++;
              }
            }
            matchValues.splice(idx, 0, matchValue);
            this.recettesMatch.splice(idx, 0, recette);
          }
        }
      }
    }
    if (this.recettesMatch && this.recettesMatch.length > 0) {
      this.optionsRecettesMatch = this.recettesMatch.map(r => ({
        label: r.titre,
        value: r
      }));
    } else {
      this.optionsRecettesMatch = [];
    }
  }

  ajouterIngredient() {
    this.ingredients.push(new Ingredient());
  }

  ajouterIngredientAutres() {
      this.ingredientsAutres.push(new Ingredient());
    }

  enleverIngredient(idx: number) {
    this.ingredients.splice(idx, 1);
  }

  enleverIngredientAutres(idx: number) {
    this.ingredientsAutres.splice(idx, 1);
  }

  ajouterRecette(cpt: number) {
    if (cpt === 1) {
      this.recettesSaison.push(new Recette());
    } else {
      this.autresRecettes.push(new Recette());
    }
  }

  enleverRecette(idx: number, cpt: number) {
    if (cpt === 1) {
      this.recettesSaison.splice(idx, 1);
    } else {
      this.autresRecettes.splice(idx, 1);
    }
  }

  calculerCourses() {
    const selectedRecettes: Recette[] = this.getAllMenuRecipes();

    const map = new Map<string, number>();
    // On ajoute les produits des recettes sélectionnées
    for (const recette of selectedRecettes) {
      if (!!recette.ingredients) {
        for (const ingredient of recette.ingredients) {
          const produit = JSON.stringify(ingredient.produit);
          if (map.has(produit)) {
            map.set(produit, map.get(produit) + ingredient.quantite);
          } else {
            map.set(produit, ingredient.quantite);
          }
        }
      }
    }
    // On retire les produits du stock restant
    for (const stock of this.ingredients) {
      if (!!stock.quantite) {
        const produit = JSON.stringify(stock.produit);
        if (map.has(produit)) {
          map.set(produit, map.get(produit) - stock.quantite);
        } else {
          map.set(produit, - stock.quantite);
        }
      }
    }

    // On ajoute les produits en plus
    for (const ingredient of this.ingredientsAutres) {
      if (!!ingredient.quantite) {
        const produit = JSON.stringify(ingredient.produit);
        if (map.has(produit)) {
          map.set(produit, map.get(produit) + +ingredient.quantite);
        } else {
          map.set(produit, ingredient.quantite);
        }
      }
    }

    const courses = new Map<string, Ingredient[]>();
    map.forEach((value: number, key: string) => {
      if (value > 0) {
        const ingredient = new Ingredient();
        ingredient.produit = JSON.parse(key);
        ingredient.quantite = value;
        if (courses.has(ingredient.produit.type)) {
          const ingredients = courses.get(ingredient.produit.type);
          ingredients.push(ingredient);
          courses.set(ingredient.produit.type, ingredients);
        } else {
          courses.set(ingredient.produit.type, [ingredient]);
        }
      }
    });
    this.courses = courses;

    let copy = '<p><strong><u>Recettes</u></strong><br/>';
    for (const recipe of selectedRecettes) {
      if (recipe.titre) {
        copy += '•&nbsp;&nbsp;' + recipe.titre;
        let first = true;
        if (recipe.ingredients && recipe.ingredients.length > 0) {
          for (const ing of recipe.ingredients) {
            if (ing.produit) {
              if (first) {
                copy += ' (';
              } else {
                copy += ', ';
              }
              if (ing.quantite) {
                copy += ing.quantite;
                if (ing.produit.unite && ing.produit.unite !== 'pièce(s)') {
                  if (ing.produit.unite === 'grammes') {
                    copy += 'g';
                  } else {
                    copy += ing.produit.unite;
                  }
                }
                copy += ' ';
              }
              copy += ing.produit.label;
              first = false;
            }
          }
          if (!first) {
            copy += ')';
          }
        }
        copy += '<br/>';
      }
    }
    copy += '<br/>';
    let first = true;
    this.courses.forEach((value: Ingredient[], key: string) => {
      if (first) {
        first = false;
      } else {
        copy += '<br/>';
      }
      copy += '<strong><u>' + key.charAt(0).toUpperCase() + key.slice(1) + '</u></strong><br/>';
      for (const ingredient of value) {
          copy += '•&nbsp;&nbsp;' + ingredient.produit.label + ' - ' + ingredient.quantite + ' ' + ingredient.produit.unite + '<br/>';
      }
    });

    const validStock = this.ingredients
      ? this.ingredients.filter(i => !!i.produit && !!i.quantite)
      : [];
    const validAutres = this.ingredientsAutres
      ? this.ingredientsAutres.filter(i => !!i.produit && !!i.quantite)
      : [];

    const copyText = copy + '</p>';
    const stockJson = JSON.stringify(validStock);
    const autresJson = JSON.stringify(validAutres);

    try {
      localStorage.setItem('recette_courses_text', copyText);
      localStorage.setItem('recette_courses_stock', stockJson);
      localStorage.setItem('recette_courses_autres', autresJson);
    } catch (e) {}

    this.onCourses.emit({
      text: copyText,
      stock: validStock,
      autres: validAutres
    });

    this.recettesCourses.length = 0;
    this.recettesCourses.push(...selectedRecettes);

    const idsToSave = Array.from(new Set(selectedRecettes.filter(r => !!r.id).map(r => r.id)));
    if (idsToSave.length > 0) {
      this.menuService.saveSelection(idsToSave, copyText, stockJson, autresJson).subscribe();
    }
  }

  goToUrl(url) {
    window.open(url, "_blank");
  }

  getNbRecettesSaison() {
    return this.recettesSaison ? this.recettesSaison.filter(r => !!r.titre).length : 0;
  }

  getNbAutresRecettes() {
    return this.autresRecettes ? this.autresRecettes.filter(r => !!r.titre).length : 0;
  }

  getNbRecettes() {
    return this.getAllMenuRecipes().length;
  }

  notify($event) {
    this.messageService.add({severity:'success', summary:'Copie effectuée', detail:'Courses copiées dans le presse-papier'});
  }
}
