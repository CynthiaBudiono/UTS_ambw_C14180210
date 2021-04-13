import { isDefined } from '@angular/compiler/src/util';
import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { CameraPhoto, CameraResultType, CameraSource, Capacitor, FilesystemDirectory, Plugins } from '@capacitor/core';
import { Platform, ToastController } from '@ionic/angular';

const { Camera, Filesystem, Storage } = Plugins;
@Injectable({
  providedIn: 'root'
})
export class FotoService {
  public dataFoto : Photo[] =[];
  private keyFoto : string = "foto";
  private platform : Platform;
  public urlImageStorage: string[] = [];
  dataupload: AngularFirestoreCollection<notes>;
  // dpturl;
  dptnotes;
  public allnotes;
  constructor(platform: Platform, private afStorage : AngularFireStorage, private afs:AngularFirestore, private toastCtrl: ToastController) {
    this.dataupload = afs.collection('datanotes');
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

    Storage.set({
      key : this.keyFoto,
      value: JSON.stringify(this.dataFoto)
    })
  }

  public async simpanFoto(foto : CameraPhoto){
    const base64Data = await this.readAsBase64(foto);

    const namaFile = new Date().getTime()+'.jpeg';
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
    const listFoto = await Storage.get({key: this.keyFoto});
    this.dataFoto = JSON.parse(listFoto.value) || [];

    if (!this.platform.is('hybrid')) {
      for(let foto of this.dataFoto) {
        const readFile = await Filesystem.readFile({
          path: foto.filePath,
          directory : FilesystemDirectory.Data
        });
        foto.webviewPath = `data:image/jpeg;base64,${readFile.data}`;

        const response = await fetch(foto.webviewPath);
        const blob = await response.blob();

        foto.dataImage = new File([blob], foto.filePath, {
          type: "image/jpeg"
        });
      }
    }
    console.log(this.dataFoto);
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

  uploaddatanotes(jdl, isi, tanggal, nilai){
    console.log("DATAAAAAAAAAAAAAAAA" + jdl + " " + isi + " " + tanggal + " " + nilai);
    alert(this.dataFoto);
    var ambilurl = this.getallurl();
    this.dataFoto=[];
    return new Promise<any>(async (resolve, reject) =>{
      const ids = this.afs.createId();
      var data = {
        id: ids,
        judul : jdl,
        isinote : isi,
        tgl : tanggal,
        nilainote : nilai,
        gambar : ambilurl,
      };
      console.log("data yang mau dimasukan : "+ data.judul + " " + data.isinote);
      this.afs
          .collection("datanotes")
          .add(data)
          .then(res => {}, err => reject(err));
          let toast = this.toastCtrl.create({
            message: 'success insert notes',
            duration: 2000,
            position: 'top',
            color:'success'
          });
          (await toast).present();
      });
      
  }

  getallnotes(){
    this.dptnotes = this.afs.collection("datanotes").snapshotChanges();
    // alert(this.dptnotes);
    this.dptnotes.subscribe(res => {
      console.log("res : " + res);
      this.allnotes = res;
      // alert("alllllllllnotessss:  " + this.allnotes);
      res.forEach(element => {
        var t = (element.payload.doc.data() as notes);
        console.log(t.judul + " " + t.isinote);
      });
    });
  }
}

interface notes {
  id:string;
  judul:string;
  isinote:string;
  tgl:string;
  nilainote:number;
  gambar:string[];
}

export interface Photo {
  filePath : string;
  webviewPath : string;
  dataImage : File;
  namafile : string;
}