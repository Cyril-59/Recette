import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
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
  ingredients: Ingredient[];
  recettesMatch: Recette[];
  autresRecettes: Recette[];
  recettesSaison: Recette[];
  selectedRecipes: Recette[];
  options: SelectItem[] = [];
  optionsSaisons: SelectItem[];
  courses: Map<string, Ingredient[]>;
  coursesText: string;
  modeEdition = true;
  mois: string[] = []
  hiver = [1, 2, 3, 12]
  printemps = [3, 4, 5, 6]
  ete = [6, 7, 8 , 9]
  automne = [9, 10, 11, 12]

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
  }

  initStock() {
    this.ingredients = [new Ingredient()];
  }

  initRecette() {
    this.autresRecettes = [new Recette()];
    this.recettesSaison = [new Recette()];
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

  enleverIngredient(idx: number) {
    this.ingredients.splice(idx, 1);
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

    const map = new Map<string, number>();
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

    /*let copy = '';
    let first = true;
    this.courses.forEach((value: Ingredient[], key: string) => {
      if (first) {
        first = false;
      } else {
        copy += '\n';  
      }
      copy += key + '\n';
      for (const ingredient of value) {
          copy += '-\t' + ingredient.produit.label + ' - ' + ingredient.quantite + ' ' + ingredient.produit.unite + '\n';
      }
    });*/

    let copy = '<p>';
    let first = true;
    this.courses.forEach((value: Ingredient[], key: string) => {
      if (first) {
        first = false;
      } else {
        copy += '<br/>';  
      }
      copy += key + '<br/>';
      for (const ingredient of value) {
          copy += '-&nbsp;&nbsp;' + ingredient.produit.label + ' - ' + ingredient.quantite + ' ' + ingredient.produit.unite + '<br/>';
      }
    });

    this.coursesText = copy + '</p>';
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
