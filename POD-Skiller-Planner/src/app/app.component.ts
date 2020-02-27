import { Component } from '@angular/core';

import skillsfromfile from './classes/skills.json';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'POD - Skill Planner';
  
  public skills:{}[] = skillsfromfile;
}