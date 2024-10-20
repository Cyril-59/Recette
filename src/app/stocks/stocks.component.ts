import { Component, OnInit, Input, OnChanges, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { Recette } from '../model/recette';
import { Ingredient } from '../model/ingredient';
import { SelectItem } from 'primeng/api/selectitem';
import { MessageService } from 'primeng/api';

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
  options: SelectItem[] = [];
  optionsSaisons: SelectItem[];
  courses: Map<string, Ingredient[]>;
  coursesText: string;
  mois: string[] = []
  hiver = [1, 2, 3, 12]
  printemps = [3, 4, 5, 6]
  ete = [6, 7, 8 , 9]
  automne = [9, 10, 11, 12]
  @Output() onCourses = new EventEmitter<string>();

  constructor(public messageService: MessageService) { }

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
      })
    }
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
    let selectedRecettes: Recette[] = [];
    if (!!this.selectedRecipes && this.selectedRecipes.length > 0) {
      selectedRecettes.push(...this.selectedRecipes);
    }
    if (!!this.recettesSaison && this.recettesSaison.length > 0) {
      selectedRecettes.push(...this.recettesSaison);
    }
    if (!!this.autresRecettes && this.autresRecettes.length > 0) {
      selectedRecettes.push(...this.autresRecettes);
    }

    /*const test = new Recette();
    test.ingredients = [];
    const test2 = new Ingredient();
    test2.quantite = 1;
    console.log(this.produits[0].value);
    test2.produit = this.produits[0].value;
    test.ingredients.push(test2);
    selectedRecettes.push(test);*/

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

    let copy = '<p>Recettes<br/>';
    for (const recipe of selectedRecettes) {
      if (recipe.titre) {
        copy += '-&nbsp;&nbsp;' + recipe.titre;
        let first = true;
        for (const ing of recipe.ingredients) {
          if (ing.produit.type == 'légume') {
            if (first) {
              copy += ' (';
            }
            if (!first) {
              copy += ', ';
            }
            copy += ing.quantite;
            if (ing.produit.unite != 'pièce(s)') {
              if (ing.produit.unite == 'grammes') {
                copy += 'g';
              } else {
                copy += ing.produit.unite;
              }
            }
            copy += ' ' + ing.produit.label;
            if (first) {
              first = false;
            }
          }
        }
        if (!first) {
          copy += ')';
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
      copy += key.charAt(0).toUpperCase() + key.slice(1) + '<br/>';
      for (const ingredient of value) {
          copy += '-&nbsp;&nbsp;' + ingredient.produit.label + ' - ' + ingredient.quantite + ' ' + ingredient.produit.unite + '<br/>';
      }
    });

    this.onCourses.emit(copy + '</p>');

    this.recettesCourses.length = 0;
    for (const recette of selectedRecettes) {
    if (recette.titre) {
      this.recettesCourses.push(recette);
      }
    }
  }

  goToUrl(url) {
    window.open(url, "_blank");
  }

  getNbRecettes() {
    let nbRecette = 0;
    if (!!this.selectedRecipes) {
      nbRecette += this.selectedRecipes.length;
    }
    if (!!this.recettesSaison && this.recettesSaison.length > 0) {
      for (const recette of this.recettesSaison) {
        if (!!recette.titre) {
          nbRecette++;
        }
      }
    }
    if (!!this.autresRecettes && this.autresRecettes.length > 0) {
      for (const recette of this.autresRecettes) {
        if (!!recette.titre) {
          nbRecette++;
        }
      }
    }
    return nbRecette;
  }

  notify($event) {
    this.messageService.add({severity:'success', summary:'Copie effectuée', detail:'Courses copiées dans le presse-papier'});
  }
}
