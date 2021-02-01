import _ from 'lodash';
import Vue from 'vue';

import { ToggleButton } from 'vue-js-toggle-button'

import template_fnfn from './templates/fonofone';
import Filepond from './mixins/filepond.js';

import Mixer from './mixer/mixer.js';
import Selecteur from './modules/selecteur.js';
import Volume from './modules/volume.js';

// Traduction
import VueI18n from 'vue-i18n';
import i18n from './traductions.js';
Vue.use(VueI18n);

// TODO Fusionner dans une classe avec Fonofone
// Creer fonction encode_audio_64, decode_audio_64

// TODO creer une configuration 0 qui contient tous les modules, mais pas les sons
/* 
 * Format standard des modules : {
 *  actif: true,
 *  disposition: { top, left, width, height }, // Notee en pourcentage
 *  valeur: null
 * }
 *
 * TODO effacer les vieux blob lors de l'importation : window.URL.revokeObjectURL(url);
 * TODO (sur?) OPtimisation : https://addyosmani.com/blog/import-on-interaction/
 */

let ApplicationFonofone = function (id, fonofone, archive) {
  return new Vue({
    el: "#" + id,
    mixins: [Filepond],
    template: template_fnfn,
    components: {
      // Import dynamique seulement si necessaire (merci webpack) https://webpack.js.org/guides/code-splitting/
      //"selecteur": () => { return import('./modules/selecteur.js') },
      //"volume": () => { return import('./modules/volume.js') },
      "selecteur": Selecteur,
      "volume": Volume,
      "toggle-button": ToggleButton
    },
    data: {
      id, fonofone, archive,
      fichier_audio: null,
      mode_colonne: false,
      mode_edition: true,
      mixer: null,
      panneaux: {
        importation: false,
        grille: true,
        waveform: true,
        menu: true,
        valeurs_modules: false,
      },
      loop: false,
      outils: {
        filepond: null
      },
      modules: {}
    },
    methods: {
      serialiser: async function () {
        let audio_base64 = await new Promise((resolve) => {
          let fileReader = new FileReader();
          fileReader.onload = (e) => resolve(fileReader.result);
          fileReader.readAsDataURL(this.fichier_audio); // TODO utiliser this.mixer.blob
        });

        let serialisation = JSON.stringify( { 
          config: this.modules, 
          fichier: audio_base64 
        });

        return serialisation;
      },
      importer: function (blob) {
        let archive_serialisee = new Promise((resolve) => {
          let fileReader = new FileReader();
          fileReader.onload = (e) => resolve(fileReader.result);
          fileReader.readAsText(blob);
        });

        archive_serialisee.then((archive) => {
          archive = JSON.parse(archive);
          this.archive = archive;
          this.charger_modules();
          Mixer.handle_to_blob(archive.fichier).then((blob) => { this.mixer.charger(blob); })
        });
      },
      charger_modules: function () {
        _.each(this.archive.config, (value, key) => {
          this.modules[key] = this.archive.config[key];

          // https://vuejs.org/v2/api/#vm-watch
          this.$watch(`modules.${key}.valeur`, (val) => {
            this.mixer[`set_${key}`](val);
          }, {deep: true});
        });
      },
      exporter: function () {
        this.fonofone.exporter(this.serialiser());
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
      waveform_id: function () {
        return `waveform-${this.id}`;
      }
    },
    watch: {
      loop: function (val) {
        this.mixer.set_loop(val);
      }
    },
    created: function () {
      this.charger_modules();
    },
    mounted: function () {

      // Initialisation des modules par les mixins
      // Filepond 

      this.mixer = new Mixer(this.waveform_id);
      Mixer.handle_to_blob(archive.fichier).then((blob) => { this.mixer.charger(blob); })

      this.repaint();
    },
    i18n
  });
}

export default ApplicationFonofone;

