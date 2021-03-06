import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActionSheetController, LoadingController } from 'ionic-angular';

import { Client } from '../../../common/services/api/client';
import { ChannelComponent } from '../../channel/channel.component';
import { Storage } from '../../../common/services/storage';
import { AttachmentService } from '../../attachments/attachment.service';
import { WalletService } from '../../wallet/wallet.service';

import { CONFIG } from '../../../config';

@Component({
  moduleId: 'module.id',
  selector: 'newsfeed-poster',
  templateUrl: 'poster.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PosterComponent {

  entity;

  minds = {
    cdn_url: CONFIG.cdnUrl
  }

  components = {
    channel: ChannelComponent
  }

  message : string = "";
  progress : number = 0;
  mature: boolean = false;

  meta = {
    message: '',
    mature: 0,
    attachment_guid: null,
    container_guid: null
  };

  @Input() placeholder : string = "Speak your mind...";

  containerGuid: any = null;
  @Input('containerGuid') set _containerGuid(guid: any) {
    this.containerGuid = guid;
    this.attachment.setContainerGuid(guid);
    this.meta.container_guid = guid;
  }

  @Input() set accessId(access_id: any){
   this.attachment.setAccessId(access_id);
  }

  @Output('prepend') prepend : EventEmitter<any> = new EventEmitter();

  storage = new Storage();

  constructor(public client : Client, public actionSheetCtrl: ActionSheetController, public attachment : AttachmentService, private loadingCtrl : LoadingController,
    private wallet : WalletService, private cd : ChangeDetectorRef){

  }

  ngOnInit(){
    this.attachment.emitter.subscribe((response : any) => {
      this.progress = response.progress;
      this.meta.attachment_guid = response.guid;
      this.cd.markForCheck();
      this.cd.detectChanges();
    });
  }

  openCamera(){
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Upload',
      buttons: [
        {
          text: 'Take a photo',
          icon: 'md-camera',
          handler: () => {
            this.attachment.takePicture()
          }
        },
        {
          text: 'Record a video',
          icon: 'md-videocam',
          handler: () => {
            this.attachment.takeVideo()
          }
        },
        {
          text: 'Pick from library',
          icon: 'md-image',
          handler: () => {
            this.attachment.selectFromLibrary();
          }
        },
        {
          text: 'Close',
          icon: 'md-close',
          role: 'cancel'
        }
      ]
    });
    actionSheet.present();
  }

  post(){
    let loader = this.loadingCtrl.create({
      //content: "Please wait...",
    });
    loader.present();

    this.client.post('api/v1/newsfeed', this.meta)
      .then((response : any) => {
        // if(this.meta.attachment_guid){
        //   this.wallet.increment(10);
        // } else {
        //   this.wallet.increment(1);
        // }

        this.meta = {
          message: '',
          mature: 0,
          attachment_guid: null,
          container_guid: this.containerGuid,
        };
        this.attachment.reset();
        this.progress = 0;
        this.prepend.next(response.activity);
        this.cd.markForCheck();
        this.cd.detectChanges();
        loader.dismiss();
      })
      .catch((err) => {
        loader.dismiss();
      })
  }

  setRichMeta(meta){
    this.meta = Object.assign(this.meta, meta);
  }

  toggleMature() {
    this.meta.mature = !this.meta.mature ? 1 : 0;
    this.cd.markForCheck();
    this.cd.detectChanges();
  }

}
