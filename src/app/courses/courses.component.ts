import { Component, OnInit, Input } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Recette } from '../model/recette';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css']
})
export class CoursesComponent implements OnInit {
  @Input() text: string;
  @Input() recettes: Recette[];

  constructor(public messageService: MessageService) { }

  ngOnInit(): void {
  }

  notify($event) {
    this.messageService.add({severity:'success', summary:'Copie effectuée', detail:'Courses copiées dans le presse-papier'});
  }

  getPlainText(): string {
    if (!this.text) return '';
    return this.text
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]*>/g, '')
      .replace(/\n\s*\n/g, '\n')
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

    const plainIngredients = this.getPlainText();
    if (plainIngredients) {
      message += plainIngredients;
    }

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }
}
