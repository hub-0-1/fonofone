import _ from 'lodash';
import Vue from 'vue';
import VueI18n from 'vue-i18n';
import { saveAs } from 'file-saver';

import template_fnfn from './partials/fonofone';
import i18n from './traductions.js';
import init_filepond from './upload_audio.js';

import './style.less';
import './gestionnaire_fonofone.js';

Vue.use(VueI18n);

/*
 * Classe parente du module en tant que tel.
 * Elle permet d'intergir avec la page
 * - Drag N Drop fichier
 * - Export
 * parametre 1 : HTML Node auquel on ajoutera le module fonofone
 * parametre 2 : id de scenario ou objet de configuration
 */

window.Fonofone = class Fonofone {
  constructor (element, seed) {

    // Determiner si on charge un scenario par id ou par objet de configuration
    if(element && element.nodeType === Node.ELEMENT_NODE) {
      this.containerElement = element;
    }
    else {
      throw "Element d'attache non valide";
    }

    // Creer l'element pour le Vue
    let app = document.createElement("div");
    app.className = "fonofone";
    app.id = "fnfn-" + window.GFonofone.getProchainIndex();
    this.containerElement.appendChild(app);

    // Crer l'instance Vue
    this.instance = new Vue({
      el: "#" + app.id,
      template: template_fnfn,
      data: {
        fichier_audio: null // Ou definit si chargement
      },
      computed: {
        url_fichier_audio: function () {
          return this.fichier_audio ? URL.createObjectURL(this.fichier_audio) : null;
        }
      },
      mounted: function () {
        this.wavesurfer = WaveSurfer.create({
          container: '#waveform',
          waveColor: 'violet',
          progressColor: 'purple'
        });
        console.log(this);
        if(this.url_fichier_audio) this.wavesurfer.load(this.url_fichier_audio);
      },
      i18n
    });

    // Upload de fichier
    this.selecteur_son = init_filepond(this);
  }

  export () { // TODO expoter le fichier audio + json config
    let blob = new Blob([this.audio], {type : 'audio/ogg'});
    saveAs(blob, "export.fnfn");
  }

  update_fichier_audio (fichier) {
    let vue = this.instance;
    vue.fichier_audio = fichier;
    vue.wavesurfer.load(vue.url_fichier_audio);
  }
}
