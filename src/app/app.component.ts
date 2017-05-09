import { Component } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';

//declare var atualizarListaCertificadosWS: any;

// const URL = '/api/';
const URL = 'https://evening-anchorage-3159.herokuapp.com/api/';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  public target:any;

  valid:boolean = false;

  isCompleted: boolean = false;

  public constructor(){

  }

  public peticao:FileUploader = new FileUploader({url: URL});
  public docsComplementares:FileUploader = new FileUploader({url: URL});

  uploadAll:any = () => {
    this.peticao.uploadAll();
    this.docsComplementares.uploadAll();
    this.valid = true;
    atualizarListaCertificadosWS();
  }

  cancelAll:any = () => {
    this.peticao.cancelAll();
    this.docsComplementares.cancelAll();
  }

  clearQueue:any = () =>{
    this.peticao.clearQueue();
    this.peticao = new FileUploader({url: URL});
    this.docsComplementares.clearQueue();
    this.docsComplementares = new FileUploader({url: URL});
  }

  public ngOnInit(): void {
    this.peticao.setOptions({ url: URL });
    this.peticao.onAfterAddingFile = (item => {
      if (this.target) this.target.value = '';
    });

    this.docsComplementares.setOptions({ url: URL });
    this.docsComplementares.onAfterAddingFile = (item => {
      if (this.target) this.target.value = '';
    });
  }

  private onClick(event:any):void {
    this.target = event.target || event.srcElement;
    console.log(event.target);
  }

  queueFill:any = () => {
    if(!this.peticao.queue.length || !this.docsComplementares.queue.length) {
        return 'false';
    }
    return 'true';
  }

  onStep1Next:any = (event)=>{
    console.log('step 1')
  }
  onStep2Next:any = (event)=>{
    console.log('step 2')
  }
  onStep3Next:any = (event)=>{
    console.log('step 3')
  }
  onStep4Next:any = (event)=>{
    console.log('step 4')
  }

  onComplete(event) {
    this.isCompleted = true;
  }

  generateUUID() {
		var d = new Date().getTime();
		if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
			d += performance.now();
		}
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			var r = (d + Math.random() * 16) % 16 | 0;
			d = Math.floor(d / 16);
			return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
		});
	};

  gerarToken(){
		// $http({
		// 	url: 'http://localhost:8085/assinador-bry-api/token',
		// 	method: 'GET'
		// }).then(function(response){
		// 	console.log("sucesso gerar token");
		// 	console.log(response.data);
		// 	document.getElementsByName("token")[0].value = response.data.token;
		// 	document.getElementsByName("tokenAssinado")[0].value = response.data.tokenAssinado;
		// }, function(error){
		// 	console.log(error);
		// 	alert(error.data);
		// })
	};

  finalizarAssinatura:any = (stepData, isSkip) => {

		console.log('Passo 3');

		var assinaturaJSON = {
				// uuid: vm.uuid,
				// pastaArquivos: vm.pastaArquivos,
				// algoritmoHash: "SHA256",
				// certificado: document.getElementsByName("certificado")[0].value,
				// cifrado: document.getElementsByName("finalizado")[0].value,
				// dadosCadeiaCarimbo: "basica",
				// dadosPDF: document.getElementsByName("dadosPDF")[0].value,
				// extensao: "pdf",
				// inicializado: document.getElementsByName("inicializado")[0].value,
				// modoOperacao: "ASSINATURA",
				// padrao: document.getElementsByName("padrao")[0].value,
				// politicaAssinatura: null,
				// tipoAssinatura: "NENHUMA_CERTIFICACAO",
				// token: document.getElementsByName("token")[0].value,
				// tokenAssinado: document.getElementsByName("tokenAssinado")[0].value,
				// urlXadesDetched: null
		};
  };

  atualizarListaCertificadosWS:any = () => {
   atualizarListaCertificadosWS();
  }
}
