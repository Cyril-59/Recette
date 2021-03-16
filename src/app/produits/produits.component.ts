import { Component, OnInit, EventEmitter, Output, HostListener } from '@angular/core';
import { ProduitService } from '../services/produit.service';
import { Produit } from '../model/produit';
import { SelectItem } from 'primeng/api/selectitem';
import { MessageService } from 'primeng/api';

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
  innerWidth: number;

  edit = false;
  editTitle = 'Création';

  @Output() onProduits = new EventEmitter<Produit[]>();

  constructor(public produitService: ProduitService, private messageService: MessageService) { }

  ngOnInit(): void {
    this.getProduits();
  }

  ngAfterViewInit(): void {
    this.innerWidth = window.innerWidth;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.innerWidth = window.innerWidth;
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
        this.getProduits();
        this.cleanProduit();
        this.messageService.add({severity:'success', summary:'Création effectuée', detail:'Produit créé'});
      });
    } else {
      this.produitService.updateProduit(produit).subscribe(() => {
        this.getProduits();
        this.cleanProduit();
        this.messageService.add({severity:'success', summary:'Modification effectuée', detail:'Produit modifié'});
      });
    }
  }

  getProduits() {
    this.produitService.getProduits().subscribe((produits) => {
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
    const types = new Set(this.produits.map((p) => p.type));
    for (const type of types) {
      this.types.push({value: type, label: type});
    }
    this.unites = [];
    const unites = new Set(this.produits.map((p) => p.unite));
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
