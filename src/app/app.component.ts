import { Component } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';

// const URL = '/api/';
const URL = 'https://evening-anchorage-3159.herokuapp.com/api/';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  public target:any;

  public constructor(){

  }

  public peticao:FileUploader = new FileUploader({url: URL});
  public docsComplementares:FileUploader = new FileUploader({url: URL});

  uploadAll:any = () => {
    this.peticao.uploadAll();
    this.docsComplementares.uploadAll();
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

  onComplete:any = (event)=>{
    console.log('the end')
  }
}
