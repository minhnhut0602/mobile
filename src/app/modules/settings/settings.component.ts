import { Component, OnInit, OnDestroy, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { NavController, LoadingController, AlertController, NavParams } from 'ionic-angular';

import { Client } from '../../common/services/api/client';
import { Storage } from '../../common/services/storage';

import { CONFIG } from '../../config';

@Component({
  moduleId: 'module.id',
  selector: 'settings',
  templateUrl: 'settings.component.html',
  //styleUrls: ['list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class SettingsComponent {

  minds = {
    cdn_url: CONFIG.cdnUrl
  }

  currentPassword : string;
  password : string;
  password2 : string;
  currentEmail : string = "";
  mailChanged: boolean = false;
  myForm : FormGroup;

  constructor(private client : Client, private cd : ChangeDetectorRef, private nav : NavController, private loadingCtrl : LoadingController,
    private storage : Storage, private params: NavParams, private alertCtrl : AlertController){
  }

  ngOnInit(){

    this.myForm = new FormGroup({
      email : new FormControl(this.currentEmail)
    });

    this.client.get('api/v1/settings/' + this.storage.get('user_guid'))
      .then((response : any) => {
        this.currentEmail = response.channel.email;
        this.detectChanges();
      });
  }

  save(){
    if(this.password != this.password2){
      this.alertCtrl.create({
          title: 'Sorry!',
          subTitle: "The passwords your entered do not match",
          buttons: ['Try again']
        })
        .present();
      return;
    }

    let loader = this.loadingCtrl.create({
      //content: "Please wait...",
    });
    loader.present();

    this.client.post('api/v1/settings/' + this.storage.get('user_guid'), {
        password: this.currentPassword,
        new_password: this.password,
        email: this.currentEmail
      })
      .then((response) => {
        this.password = "";
        this.password2 = "";
        loader.dismiss();
        this.nav.pop();
      })
      .catch((error) => {
        loader.dismiss();
        this.alertCtrl.create({
            title: 'Sorry!',
            subTitle: error.message,
            buttons: ['Try again']
          })
          .present();
      });
  }

  detectChanges() {
    this.cd.markForCheck();
    this.cd.detectChanges();
  }

}
