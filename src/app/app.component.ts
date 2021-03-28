import { Component } from '@angular/core';
import { BitvavoService } from 'src/bitvavo.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'BitvavoBot';

  constructor(bitvavoService: BitvavoService) {
    const balanceList = bitvavoService.getBalance().then(bl => {
      console.log(bl);
    });
  }
}

// https://www.techiediaries.com/fix-cors-with-angular-cli-proxy-configuration/