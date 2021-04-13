import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FotoService } from '../services/foto.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  constructor(public fotoService : FotoService, private router: Router) {
    this.fotoService.getallnotes();
  }

  godet(idx){
    alert(idx);
    this.router.navigate(["tabs/tab3/" + idx]);
  }
}
