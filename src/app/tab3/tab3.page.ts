import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { FotoService } from '../services/foto.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
  nomor;
  dapatid;
  constructor(private route: ActivatedRoute, public fotoService:FotoService, private afs:AngularFirestore, public router:Router) { }


  ngOnInit(){
    this.nomor = this.route.snapshot.paramMap.get("nomor");
    alert(this.nomor);
  }

  goupdet(idx){
    this.dapatid = this.fotoService.dptsmwnotes[idx].id;
    this.fotoService.editnotes(this.dapatid);
    this.router.navigate(["/tabs/tab1"]);
    // this.fotoService.editnotes(this.dapatid, jdl, isi, tanggal,ni, url);
  }

  godelete(idx){
    this.dapatid = this.fotoService.dptsmwnotes[idx].id;
    this.fotoService.hapusnotes(this.dapatid);
    this.router.navigate(["/tabs/tab2"]);
  }
}
