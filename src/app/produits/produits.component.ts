import { Component, OnInit, EventEmitter, Output, HostListener, Input } from '@angular/core';
import { ProduitService } from '../services/produit.service';
import { Produit } from '../model/produit';
import { SelectItem, MessageService } from 'primeng/api';

@Component({
  selector: 'app-produits',
  templateUrl: './produits.component.html',
  styleUrls: ['./produits.component.css']
})
export class ProduitsComponent implements OnInit {
  produitId: any;
  produits: Produit[];

  ete: boolean;
  printemps: boolean;
  automne: boolean;
  hiver: boolean;

  unite: string;
  type: string;

  options: SelectItem[];
  types: SelectItem[];
  unites: SelectItem[];
  @Input() innerWidth: number;

  edit = false;
  editTitle = 'Création';

  selectedTypeFilter: string = null;

  filterPrintemps = false;
  filterEte = false;
  filterAutomne = false;
  filterHiver = false;

  toggleSeasonFilter(season: 'printemps' | 'ete' | 'automne' | 'hiver', dt: any): void {
    if (season === 'printemps') {
      this.filterPrintemps = !this.filterPrintemps;
      dt.filter(this.filterPrintemps ? true : null, 'printemps', 'equals');
    } else if (season === 'ete') {
      this.filterEte = !this.filterEte;
      dt.filter(this.filterEte ? true : null, 'ete', 'equals');
    } else if (season === 'automne') {
      this.filterAutomne = !this.filterAutomne;
      dt.filter(this.filterAutomne ? true : null, 'automne', 'equals');
    } else if (season === 'hiver') {
      this.filterHiver = !this.filterHiver;
      dt.filter(this.filterHiver ? true : null, 'hiver', 'equals');
    }
  }

  @Output() onProduits = new EventEmitter<Produit[]>();

  constructor(public produitService: ProduitService, private messageService: MessageService) { }

  ngOnInit(): void {
    this.getProduits();
  }

  produitSelected(id) {
    if (typeof id === 'number') {
      let produit = this.produits.find((p) => p.id === id);
      this.produitId = produit.id;
      this.ete = produit.ete;
      this.printemps = produit.printemps;
      this.automne = produit.automne;
      this.hiver = produit.hiver;
      this.type = produit.type;
      this.unite = produit.unite;
      this.edit = true;
      this.editTitle = 'Modification';
      setTimeout(() => {
        const el = document.getElementById('editbox');
        if (el) el.scrollIntoView();
      })
    }
  }

  filterByType(type: string, dt: any): void {
    if (this.selectedTypeFilter === type) {
      this.selectedTypeFilter = null;
      dt.filter(null, 'type', 'equals');
    } else {
      this.selectedTypeFilter = type;
      dt.filter(type, 'type', 'equals');
    }
  }

  creerProduit() {
    let produit = this.produits.find((p) => p.id === this.produitId);
    if (!produit) {
      produit = new Produit();
      produit.label = this.produitId;
    }
    produit.automne = this.automne;
    produit.hiver = this.hiver;
    produit.printemps = this.printemps;
    produit.ete = this.ete;
    produit.unite = this.unite;
    produit.type = this.type;
    if (!produit.id) {
      this.produitService.createProduit(produit).subscribe(() => {
        this.edit = false;
        this.getProduits();
        this.cleanProduit();
        this.messageService.add({severity:'success', summary:'Création effectuée', detail:'Produit créé'});
      });
    } else {
      this.produitService.updateProduit(produit).subscribe(() => {
        this.edit = false;
        this.getProduits();
        this.cleanProduit();
        this.messageService.add({severity:'success', summary:'Modification effectuée', detail:'Produit modifié'});
      });
    }
  }

  getProduits() {
    this.produitService.getProduits().subscribe((produits) => {
      for (const p of produits) {
        if (p.type) {
          const t = p.type.trim();
          if (t.toLowerCase() === 'épicerie vrac' || t.toLowerCase() === 'vrac') {
            p.type = 'Vrac';
          } else if (t.toLowerCase() === 'légume' || t.toLowerCase() === 'legume') {
            p.type = 'Légume';
          } else if (t.toLowerCase() === 'frais') {
            p.type = 'Frais';
          } else if (t.toLowerCase() === 'épicerie' || t.toLowerCase() === 'epicerie') {
            p.type = 'Épicerie';
          } else {
            p.type = t.charAt(0).toUpperCase() + t.slice(1);
          }
        }
      }
      this.produits = produits;
      this.initOptions();
      this.onProduits.emit(this.produits);
    }, (error) => {
      setTimeout(() => {
        this.getProduits();
      }, 1000);
    });
  }

  initOptions() {
    this.options = this.produits.map((p) => {
      return {value: p.id, label: p.label}
    });
    this.types = [];
    const types = new Set(this.produits.map((p) => p.type).filter(t => !!t));
    const sortedTypes = Array.from(types).sort();
    for (const type of sortedTypes) {
      this.types.push({value: type, label: type});
    }
    this.unites = [];
    const unites = new Set(this.produits.map((p) => p.unite).filter(u => !!u));
    for (const unite of unites) {
      this.unites.push({value: unite, label: unite});
    }
  }

  deleteProduit(id: number) {
    this.produitService.deleteProduit(id).subscribe(() => {
      this.getProduits();
      this.cleanProduit();
      this.messageService.add({severity:'success', summary:'Suppression effectuée', detail:'Produit supprimé'});
    }, (error) => {
      this.messageService.add({severity:'error', summary:'Suppression impossible', detail:'Produit présent dans un ingrédient'});
    });
  }

  cleanProduit() {
    this.produitId = null;
    this.ete = null;
    this.printemps = null;
    this.automne = null;
    this.hiver = null;
    this.unite = null;
    this.type = null;
    this.editTitle = 'Création';
  }
}
