import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from 'src/app/app.component';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { ListComponent } from 'src/app/list/list.component';
import { DrawComponent } from 'src/app/draw/draw.component';
import { HomeComponent } from 'src/app/home/home.component';
import { BearComponent } from 'src/app/components/bear/bear.component';
import { PencilComponent } from 'src/app/components/pencil/pencil.component';
import { FabricDrawComponent } from 'src/app/fabric-draw/fabric-draw.component';
import { SpinnerComponent } from 'src/app/components/spinner/spinner.component';


@NgModule({
  declarations: [AppComponent, ListComponent, DrawComponent, FabricDrawComponent, HomeComponent, BearComponent, PencilComponent, SpinnerComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, FormsModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule { }
