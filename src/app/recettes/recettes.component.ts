import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Recette } from '../model/recette';
import { RecetteService } from '../services/recette.service';
import { Produit } from '../model/produit';
import { SelectItem } from 'primeng/api/selectitem';
import { Ingredient } from '../model/ingredient';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-recettes',
  templateUrl: './recettes.component.html',
  styleUrls: ['./recettes.component.css']
})
export class RecettesComponent implements OnInit {

  @Input() produits: SelectItem[];
  recette: Recette;
  recettes: Recette[];
  @Output() onRecettes = new EventEmitter<Recette[]>();

  edit = false;
  editTitle = 'Création';

  ete: boolean;
  printemps: boolean;
  automne: boolean;
  hiver: boolean;

  constructor(public recetteService: RecetteService, private messageService: MessageService) { }

  ngOnInit(): void {
    this.initRecette();
    this.getRecettes();
  }

  getRecettes() {
    this.recetteService.getRecettes().subscribe((recettes) => {
      for (const recette of recettes) {
        let stringIngredients = '';
        let tooltipIngredients = '';
        for (const ingredient of recette.ingredients) {
          stringIngredients += ingredient.produit.label + ' ';
          tooltipIngredients += '- ' + ingredient.produit.label + ' ' + ingredient.quantite + ' ' + ingredient.produit.unite + '\n';
        }
        recette.stringIngredients = stringIngredients;
        recette.tooltipIngredients = tooltipIngredients;
        const split = recette.titre.split(' ');
        let url = 'https://www.google.com/search?q=';
        let params = '';
        for (const str of split) {
          params += str + '+';
        }
        url += escape(params.substr(0, params.length - 1));
        recette.url = url;
      }
      this.recettes = recettes;
      this.onRecettes.emit(this.recettes);
    }, (error) => {
      setTimeout(() => {
        this.getRecettes();
      }, 1000);
    });
  }

  ajouterIngredient() {
    this.recette.ingredients.push(new Ingredient());
  }

  enleverIngredient(idx: number) {
    this.recette.ingredients.splice(idx, 1);
  }

  creerRecette() {
    this.recette.automne = this.automne;
    this.recette.ete = this.ete;
    this.recette.hiver = this.hiver;
    this.recette.printemps = this.printemps;
    if (!this.recette.id) {
      this.recetteService.createRecette(this.recette).subscribe(() => {
        this.initRecette();
        this.getRecettes();
        this.messageService.add({severity:'success', summary:'Création effectuée', detail:'Recette créée'});
      }, (error) => {
        this.messageService.add({severity:'error', summary:'Création echouée', detail:'Données manquantes'});
      });
    } else {
      this.recetteService.updateRecette(this.recette).subscribe(() => {
        this.initRecette();
        this.getRecettes();
        this.messageService.add({severity:'success', summary:'Modification effectuée', detail:'Recette modifiée'});
      }, (error) => {
        this.messageService.add({severity:'error', summary:'Création échouée', detail:'Données manquantes'});
      });
    }
  }

  initRecette() {
    this.recette = new Recette();
    this.ete = this.recette.ete
    this.printemps = this.recette.printemps
    this.automne = this.recette.automne
    this.hiver = this.recette.hiver
    this.recette.ingredients = [new Ingredient()];
    this.editTitle = 'Création';
  }

  recipeSelected(id: number) {
    this.recette = this.recettes.find((r) => r.id === id);
    this.automne = this.recette.automne;
    this.ete = this.recette.ete;
    this.hiver = this.recette.hiver;
    this.printemps = this.recette.printemps;
    this.edit = true;
    this.editTitle = 'Modification';
  }

  deleteRecette(id: number) {
    this.recetteService.deleteRecette(id).subscribe(() => {
      this.initRecette();
      this.getRecettes();
    });
  }

  goToUrl(url) {
    window.open(url, "_blank");
  }

  deduireSaison() {
    this.ete = true
    this.automne = true
    this.printemps = true
    this.hiver = true
    this.recette.ingredients.map(i => i.produit).forEach(p => {
      if (!p.automne) {
        this.automne = false
      }
      if (!p.ete) {
        this.ete = false
      }
      if (!p.hiver) {
        this.hiver = false
      }
      if (!p.printemps) {
        this.printemps = false
      }
    })
  }
}
