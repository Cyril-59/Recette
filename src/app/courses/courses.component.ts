import { Component, OnInit, Input } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Recette } from '../model/recette';
import { Ingredient } from '../model/ingredient';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css']
})
export class CoursesComponent implements OnInit {
  @Input() text: string;
  @Input() recettes: Recette[];
  @Input() stockIngredients: Ingredient[];
  @Input() autresIngredients: Ingredient[];

  constructor(public messageService: MessageService) { }

  ngOnInit(): void {
  }

  notify($event) {
    this.messageService.add({severity:'success', summary:'Copie effectuée', detail:'Courses copiées dans le presse-papier'});
  }

  onTextChange(newText: string) {
    if (newText) {
      try {
        localStorage.setItem('recette_courses_text', newText);
      } catch (e) {}
    }
  }

  getPlainText(): string {
    if (!this.text) return '';
    return this.text
      .replace(/<strong><u>(.*?)<\/u><\/strong>/gi, '*$1*')
      .replace(/<u><strong>(.*?)<\/strong><\/u>/gi, '*$1*')
      .replace(/<strong>(.*?)<\/strong>/gi, '*$1*')
      .replace(/<b>(.*?)<\/b>/gi, '*$1*')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim();
  }

  shareOnWhatsApp() {
    let message = '🛒 *Liste de courses*\n\n';

    if (this.recettes && this.recettes.length > 0) {
      message += '📋 *Recettes au menu :*\n';
      for (const r of this.recettes) {
        message += `• ${r.titre}\n`;
      }
      message += '\n';
    }

    if (this.stockIngredients && this.stockIngredients.length > 0) {
      message += '📦 *En stock (déduit des courses) :*\n';
      for (const ing of this.stockIngredients) {
        message += `• ${ing.quantite} ${ing.produit?.unite || ''} ${ing.produit?.label}\n`;
      }
      message += '\n';
    }

    if (this.autresIngredients && this.autresIngredients.length > 0) {
      message += '🛍️ *Autres besoins (ajouté aux courses) :*\n';
      for (const ing of this.autresIngredients) {
        message += `• ${ing.quantite} ${ing.produit?.unite || ''} ${ing.produit?.label}\n`;
      }
      message += '\n';
    }

    const plainIngredients = this.getPlainText();
    if (plainIngredients) {
      message += plainIngredients;
    }

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }
}
