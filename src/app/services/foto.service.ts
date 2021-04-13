import { NgIf } from '@angular/common';
import { isDefined } from '@angular/compiler/src/util';
import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { CameraPhoto, CameraResultType, CameraSource, Capacitor, FilesystemDirectory, Plugins } from '@capacitor/core';
import { Platform, ToastController } from '@ionic/angular';
import { Observable } from 'rxjs';

const { Camera, Filesystem, Storage } = Plugins;
@Injectable({
  providedIn: 'root'
})
export class FotoService {
  public dataFoto : Photo[] =[];
  private keyFoto : string = "foto";
  private platform : Platform;
  public urlImageStorage: string[] = [];
  isidata : Observable<notes[]>;
  dataupload: AngularFirestoreCollection<notes>;
  // dpturl;
  dptnotes;
  dptsmwnotes;
  public allnotes;
  mauupdate=false;
  mauid;
  public jdl;
  public isi;
  public tanggal;
  public nilai;
  constructor(platform: Platform, private afStorage : AngularFireStorage, private afs:AngularFirestore, private toastCtrl: ToastController) {
    this.dataupload = afs.collection('datanotes');
    // this.isidata = this.dataupload.valueChanges();
    this.platform = platform;
  }

  public async tambahFoto(){
    const Foto = await Camera.getPhoto ({
      resultType : CameraResultType.Uri,
      source : CameraSource.Camera,
      quality:100
    });
    console.log(Foto);

    const fileFoto = await this.simpanFoto(Foto);

    this.dataFoto.unshift(fileFoto);

    // Storage.set({
    //   key : this.keyFoto,
    //   value: JSON.stringify(this.dataFoto)
    // })
  }

  public async simpanFoto(foto : CameraPhoto){
    const base64Data = await this.readAsBase64(foto);

    const namaFile = new Date().getTime()+'.jpeg';
    // const namaFile = 'a.jpeg';
    const simpanFile = await Filesystem.writeFile({
      path : namaFile,
      data : base64Data,
      directory : FilesystemDirectory.Data
    });

    const response = await fetch(foto.webPath);
    const blob = await response.blob();
    const dataFoto = new File([blob], foto.path, {
      type: "image/jpeg"
    })
    if(this.platform.is('hybrid')){
      return {
        filePath : simpanFile.uri,
        webviewPath : Capacitor.convertFileSrc(simpanFile.uri),
        dataImage : dataFoto,
        namafile: namaFile
      }
    }
    else{
      return {
        filePath : namaFile,
        webviewPath : foto.webPath,
        dataImage : dataFoto,
        namafile: namaFile
      }
    }
  }

  private async readAsBase64(foto : CameraPhoto) {
    if (this.platform.is('hybrid')){
      const file = await Filesystem.readFile({
        path: foto.path
      });
      return file.data;
    } else {

      const response = await fetch(foto.webPath);
      const blob = await response.blob();

      return await this.convertBlobToBase64(blob) as string;
    }
  }

  convertBlobToBase64 = (blob : Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader;
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });

  public async loadFoto(){
    // const listFoto = await Storage.get({key: this.keyFoto});
    // this.dataFoto = JSON.parse(listFoto.value) || [];

    // if (!this.platform.is('hybrid')) {
    //   for(let foto of this.dataFoto) {
    //     const readFile = await Filesystem.readFile({
    //       path: foto.filePath,
    //       directory : FilesystemDirectory.Data
    //     });
    //     foto.webviewPath = `data:image/jpeg;base64,${readFile.data}`;

    //     const response = await fetch(foto.webviewPath);
    //     const blob = await response.blob();

    //     foto.dataImage = new File([blob], foto.filePath, {
    //       type: "image/jpeg"
    //     });
    //   }
    // }
    // console.log(this.dataFoto);
  }
  getallurl(){
    var dpturl = [];
    for(var i =0; i< this.dataFoto.length;i++){
      const imgFilepath = `imgStorage/${this.dataFoto[i].filePath}`;
      this.afStorage.upload(imgFilepath, this.dataFoto[i].dataImage).then(() => {
        this.afStorage.storage.ref().child(imgFilepath).getDownloadURL().then((url) =>{
          dpturl.push(url);
          this.urlImageStorage.unshift(url);
          
          console.log("url di upload foto: "+url);
      });
    });
    }
    return dpturl;
  }

  uploaddatanotes(){
    console.log("DATAAAAAAAAAAAAAAAA" + this.jdl + " " + this.isi + " " + this.tanggal + " " + this.nilai);
    // alert(this.dataFoto[0].webviewPath);
    //var ambilurl = this.getallurl();
    
    let ids;
    if(this.mauupdate == true ){
      ids = this.mauid;
    }
    else{
      ids = this.afs.createId();
    }
    const imgFilepath = `imgStorage/${this.dataFoto[0].filePath}`;
    this.afStorage.upload(imgFilepath, this.dataFoto[0].dataImage).then(() => {
      this.afStorage.storage.ref().child(imgFilepath).getDownloadURL().then((url) =>{
        this.urlImageStorage.unshift(url);
        console.log("url di upload foto: "+url);
        // console.log("foto " + this.dataFoto[0].filePath);
        this.dataupload.doc(ids).set({
          id: ids,
          judul : this.jdl,
          isinote : this.isi,
          tgl : this.tanggal,
          nilainote : this.nilai,
          gambar : url,
        });
      });
      this.dataFoto=[];
      this.mauupdate=false;
    });
      
  }

  getallnotes(){
    this.dptnotes = this.afs.collection("datanotes").snapshotChanges();
    // alert(this.dptnotes);
    this.dptnotes.subscribe(res => {
      console.log("res : " + res);
      this.allnotes = res;
      this.dptsmwnotes = [];
      // alert("alllllllllnotessss:  " + this.allnotes);
      res.forEach(element => {
        var t = (element.payload.doc.data() as notes);
        this.dptsmwnotes.unshift(t);
        console.log(t.judul + " " + t.isinote);
      });
    });
  }

  hapusnotes(id){
    this.dataupload.doc(id).delete();
  }

  editnotes(id){
    this.mauid = id;
    this.mauupdate = true;

    // this.uploaddatanotes();
    // this.dataupload.doc(id).update({ 
    //   judul: jdl,
    //   isinote : isi,
    //   tgl : tanggal,
    //   nilainote: ni,
    //   gambar: url
    // });
  }
}

interface notes {
  id:string;
  judul:string;
  isinote:string;
  tgl:Date;
  nilainote:number;
  gambar:string[];
}

export interface Photo {
  filePath : string;
  webviewPath : string;
  dataImage : File;
  namafile : string;
}