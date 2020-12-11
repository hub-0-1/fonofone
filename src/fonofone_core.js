import Vue from 'vue';
import _ from 'lodash';
import { saveAs } from 'file-saver';

import { ToggleButton } from 'vue-js-toggle-button'

import template_fnfn from './templates/fonofone';
import Filepond from './mixins/filepond.js';

import Mixer from './mixer/mixer.js';
import Selecteur from './modules/selecteur.js';
import Volume from './modules/volume.js';
import Vitesse from './modules/vitesse.js';

// Traduction
import VueI18n from 'vue-i18n';
import i18n from './traductions.js';
Vue.use(VueI18n);

// TODO creer une configuration 0 qui contient tous les modules, mais pas les sons
/* 
 * Format standard des modules : {
 *  disposition: { top, left, width, height }, // Notee en pourcentage
 *  valeur: null
 * }
 *
 */

let ApplicationFonofone = function (id, archive, fonofone) {
  return new Vue({
    el: "#" + id,
    mixins: [Filepond],
    template: template_fnfn,
    components: {
      "selecteur": Selecteur,
      "volume": Volume,
      "vitesse": Vitesse,
      "toggle-button": ToggleButton
    },
    i18n,
    data: {
      id, archive,
      fichier_audio: null,
      mode_colonne: true,
      mode_edition: true,
      mixer: null,
      panneaux: {
        importation: false,
        grille: true,
        waveform: true,
        menu: true
      },
      loop: false,
      outils: {
        filepond: null
      }
    },
    methods: {
      exporter: function () {
        this.serialiser().then((archive) => { 
          saveAs(new Blob([archive]), "archive.fnfn"); 
        });
      },
      serialiser: async function () {
        return JSON.stringify({ 
          config: this.archive.config, 
          fichier: await this.blob_a_base64(this.mixer.blob) 
        });
      },
      blob_a_base64: function (blob) {
        return new Promise((resolve) => {
          let fileReader = new FileReader();
          fileReader.onload = (e) => resolve(fileReader.result);
          fileReader.readAsDataURL(blob);
        });
      },
      importer: function (fichier) {
        return new Promise (async (resolve) => {
          let archive_serialisee = await new Promise((resolve) => {
            let fileReader = new FileReader();
            fileReader.onload = (e) => resolve(fileReader.result);
            fileReader.readAsText(fichier);
          });

          this.archive = JSON.parse(archive_serialisee);
          this.base64_a_blob(this.archive.fichier).then((blob) => {
            return this.mixer.charger(blob)
          }).then(() => { 
            resolve(true) 
          });
        });
      },
      base64_a_blob: async function (base64) {
        return await (await fetch(base64)).blob();
      },
      synchroniser_modules: function () {
        _.each(this.archive.config, (v, key) => {
          this.$watch(`archive.config.${key}.valeur`, (valeur) => { // https://vuejs.org/v2/api/#vm-watch
            this.mixer[`set_${key}`](valeur);
          }, {deep: true, immediate: true});
        });
      },
      repaint: function () {
        window.setTimeout(() => {
          var evt = document.createEvent('UIEvents');
          evt.initUIEvent('resize', true, false,window,0);
          window.dispatchEvent(evt);
        }, 0);
      }
    },
    computed: {
      waveform_id: function () { return `waveform-${this.id}`; }
    },
    watch: {
      loop: function (val) {
        this.mixer.set_loop(val);
      }
    },
    mounted: function () {

      // Initialisation de Filepond par les mixins

      this.mixer = new Mixer(this.waveform_id, this.id);
      this.importer(this.archive).then(() => {
        this.synchroniser_modules();
        this.repaint();
      });
    }
  });
}

export default ApplicationFonofone;

