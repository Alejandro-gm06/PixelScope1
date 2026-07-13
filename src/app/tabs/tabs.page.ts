import { Component } from '@angular/core';
import {
  IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  homeOutline, colorPaletteOutline, layersOutline,
  eyedropOutline, barChartOutline, gitCompareOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom" class="custom-tab-bar">
        <ion-tab-button tab="home">
          <ion-icon name="home-outline"></ion-icon>
          <ion-label>Inicio</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="channels">
          <ion-icon name="layers-outline"></ion-icon>
          <ion-label>Canales</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="color-spaces">
          <ion-icon name="color-palette-outline"></ion-icon>
          <ion-label>Espacios</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="inspector">
          <ion-icon name="eyedrop-outline"></ion-icon>
          <ion-label>Inspector</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="histograms">
          <ion-icon name="bar-chart-outline"></ion-icon>
          <ion-label>Histogramas</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="comparator">
          <ion-icon name="git-compare-outline"></ion-icon>
          <ion-label>Comparar</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
  styles: [`
    .custom-tab-bar {
      --background: rgba(10, 10, 20, 0.95);
      --border: 1px solid rgba(255, 255, 255, 0.06);
      backdrop-filter: blur(20px);
      padding-bottom: env(safe-area-inset-bottom);
    }

    ion-tab-button {
      --color: rgba(255, 255, 255, 0.4);
      --color-selected: #a78bfa;
      --padding-top: 6px;
      --padding-bottom: 6px;
      font-size: 10px;
      transition: all 0.2s ease;
    }

    ion-tab-button::part(native) {
      transition: transform 0.2s ease;
    }

    ion-tab-button.tab-selected::part(native) {
      transform: translateY(-2px);
    }

    ion-tab-button ion-icon {
      font-size: 22px;
      margin-bottom: 2px;
    }

    ion-tab-button ion-label {
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 0.3px;
    }
  `]
})
export class TabsPage {
  constructor() {
    addIcons({
      homeOutline, colorPaletteOutline, layersOutline,
      eyedropOutline, barChartOutline, gitCompareOutline
    });
  }
}
