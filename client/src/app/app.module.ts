import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Shared components
import { HeaderComponent } from './shared/header/header.component';
import { SideNavigationComponent } from './shared/side-navigation/side-navigation.component';
import { AppLayoutComponent } from './shared/app-layout/app-layout.component';

// Pages
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { StarredComponent } from './pages/starred/starred.component';
import { DataCardFullComponent } from './shared/data-cards/data-card-full/data-card-full.component';
import { DataCardSmallComponent } from './shared/data-cards/data-card-small/data-card-small.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    HeaderComponent,
    SideNavigationComponent,
    AppLayoutComponent,
    StarredComponent,
    DataCardFullComponent,
    DataCardSmallComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
