import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BrowserModule }        from '@angular/platform-browser';

import { HomeComponent } from './home/home.component';

import { PlannerComponent } from './classes/planner/planner.component';

const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'planner/:id', component: PlannerComponent},
  {path: 'home', component: HomeComponent}
  ];

@NgModule({
  imports: [
    BrowserModule,
    RouterModule.forRoot( 
      routes,
      { enableTracing: true } // <-- debugging purposes only
     ),
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
