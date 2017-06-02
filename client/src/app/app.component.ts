import { ViewChild, Component } from '@angular/core';
import { JsonInputComponent } from './json-input/json-input.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  setPoint = 70
  temperature = 75

  ngOnInit() {
    setInterval(() => {
      if (Math.abs(this.temperature - this.setPoint) > 0.01) {
        this.temperature += (this.setPoint - this.temperature)*0.5;
      }
    }, 1000);
  }
}
