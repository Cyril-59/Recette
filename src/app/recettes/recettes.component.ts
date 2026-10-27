import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Recette } from '../model/recette';
import { RecetteService } from '../services/recette.service';
import { Produit } from '../model/produit';
import { Ingredient } from '../model/ingredient';
import { SelectItem, MessageService } from 'primeng/api';

@Component({
  selector: 'app-recettes',
  templateUrl: './recettes.component.html',
  styleUrls: ['./recettes.component.css']
})
export class RecettesComponent implements OnInit {

  @Input() produits: SelectItem[];
  @Input() innerWidth: number;
  recette: Recette;
  recettes: Recette[];
  @Output() onRecettes = new EventEmitter<Recette[]>();

  edit = false;
  editTitle = 'Création';

  instructionsDialog = false;
  recipeForInstructions: Recette = null;

  predefinedTags: string[] = ['Végétarien', 'Express (< 25 min)', 'Batch cooking', 'One Pot / Plat unique'];
  customTagInput: string = '';
  selectedLinkedRecipe: Recette = null;

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
        recette.tags = recette.tags || [];
        (recette as any).stringTags = (recette.tags || []).join(' ');
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
    (this.recette as any).linkedRecetteIds = (this.recette.linkedRecettes || []).map(r => r.id);

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
    this.recette.tags = [];
    this.recette.linkedRecettes = [];
    this.selectedLinkedRecipe = null;
    this.customTagInput = '';
    this.ete = this.recette.ete;
    this.printemps = this.recette.printemps;
    this.automne = this.recette.automne;
    this.hiver = this.recette.hiver;
    this.recette.ingredients = [new Ingredient()];
    this.editTitle = 'Création';
  }

  recipeSelected(id: number) {
    this.recette = this.recettes.find((r) => r.id === id);
    if (!this.recette.tags) {
      this.recette.tags = [];
    }
    if (!this.recette.linkedRecettes) {
      this.recette.linkedRecettes = [];
    }
    this.selectedLinkedRecipe = null;
    this.customTagInput = '';
    this.automne = this.recette.automne;
    this.ete = this.recette.ete;
    this.hiver = this.recette.hiver;
    this.printemps = this.recette.printemps;
    this.edit = true;
    this.editTitle = 'Modification';
    setTimeout(() => {
      const el = document.getElementById('editbox');
      if (el) el.scrollIntoView();
    })
  }

  get otherRecettesOptions(): SelectItem[] {
    if (!this.recettes) return [];
    return this.recettes
      .filter(r => r.id !== this.recette?.id)
      .map(r => ({ label: r.titre, value: r }));
  }

  addLinkedRecipe(): void {
    if (this.selectedLinkedRecipe) {
      if (!this.recette.linkedRecettes) {
        this.recette.linkedRecettes = [];
      }
      if (!this.recette.linkedRecettes.some(r => r.id === this.selectedLinkedRecipe.id)) {
        this.recette.linkedRecettes.push({ id: this.selectedLinkedRecipe.id, titre: this.selectedLinkedRecipe.titre });
      }
      this.selectedLinkedRecipe = null;
    }
  }

  removeLinkedRecipe(id: number): void {
    if (this.recette.linkedRecettes) {
      this.recette.linkedRecettes = this.recette.linkedRecettes.filter(r => r.id !== id);
    }
  }

  hasTag(tag: string): boolean {
    return !!this.recette?.tags?.includes(tag);
  }

  toggleTag(tag: string): void {
    if (!this.recette.tags) {
      this.recette.tags = [];
    }
    const idx = this.recette.tags.indexOf(tag);
    if (idx > -1) {
      this.recette.tags.splice(idx, 1);
    } else {
      this.recette.tags.push(tag);
    }
  }

  addCustomTag(): void {
    if (this.customTagInput && this.customTagInput.trim().length > 0) {
      const tag = this.customTagInput.trim();
      if (!this.recette.tags) {
        this.recette.tags = [];
      }
      if (!this.recette.tags.includes(tag)) {
        this.recette.tags.push(tag);
      }
      this.customTagInput = '';
    }
  }

  removeTag(tag: string): void {
    if (this.recette.tags) {
      const idx = this.recette.tags.indexOf(tag);
      if (idx > -1) {
        this.recette.tags.splice(idx, 1);
      }
    }
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

  viewInstructions(recipe: Recette) {
    this.recipeForInstructions = recipe;
    this.instructionsDialog = true;
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

  getNbIngredients() {
    let nb = 0;
    for (const ing of this.recette.ingredients) {
      if (ing.produit && ing.produit.label) {
        nb++;
      }
    }
    return nb;
  }
}
