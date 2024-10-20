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
}
