import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FotoService } from '../services/foto.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  constructor(public fotoService:FotoService, public router:Router) {}
  txtjudul;
  txtisi;
  txtdate;
  txtnilai;

  tambahfoto(){
    this.fotoService.dataFoto=[];
    this.fotoService.tambahFoto();
  }

  save(){
    this.fotoService.jdl = this.txtjudul;
    this.fotoService.isi = this.txtisi;
    this.fotoService.tanggal = this.txtdate;
    this.fotoService.nilai = this.txtnilai;
    this.fotoService.uploaddatanotes();
    this.router.navigate(["/tabs/tab2"]);
  }
}
