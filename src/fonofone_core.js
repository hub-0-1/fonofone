import Vue from 'vue';
import VueI18n from 'vue-i18n';
import WaveSurfer from 'wavesurfer';
import * as FilePond from 'filepond';
import { ToggleButton } from 'vue-js-toggle-button'

import template_fnfn from './templates/fonofone';

import i18n from './traductions.js';
import 'filepond/dist/filepond.min.css';

import FNFNSelecteur from './modules/selecteur.js';

Vue.use(VueI18n);

let ApplicationFonofone = function (id, fonofone, archive) {
  return new Vue({
    el: "#" + id,
    template: template_fnfn,
    components: {
      "selecteur": FNFNSelecteur,
      "toggle-button": ToggleButton
    },
    data: {
      id, fonofone, archive
      mode_edition: true,
      panneaux: {
        importation: false,
        grille: true,
        waveform: true,
        menu: false,
        valeurs_modules: false,
      },
      modules: {
        volume: {},
        arpegiateur: {},
        selecteur: {
          actif: true,
          position: {}, // En % de la grille
          valeur: {
            debut: null,
            fin: null
          }
        }
      },
      fichier_audio: null // Ou definit si chargement
    },
    methods: {
      init_filepond: function () {

        // Upload fichiers
        let pond = FilePond.create({ 
          name: 'filepond',
          credits: false
        });

        this.$refs.filepond.appendChild(pond.element);

        let filepond = this.$refs.filepond.firstChild;
        filepond.addEventListener('FilePond:addfile', e => { 

          if(e.detail.file.fileType.match(/audio/)) {
            this.update_fichier_audio(e.detail.file.file);
          } else if (e.detail.file.fileExtension == "fnfn") {
            this.fonofone.importer(e.detail.file.file);
          } else {
            throw "type de fichier non valide";
          }
        });
      },
      init_wavesurfer: function () {
        
        // Representation graphique du son
        this.wavesurfer = WaveSurfer.create({
          container: `#${this.waveform_id}`,
          waveColor: 'violet',
          progressColor: 'purple',
          height: 100
        });
      },
      configurer: function (archive) {
        if(!archive) {
          // TODO : Charger la configuration par defaut

        } else {
          this.update_fichier_audio(archive.fichier);
          // TODO appliquer la configuration
        }
      },
      serialiser: async function () {
        let audio_base64 = await new Promise((resolve) => {
          let fileReader = new FileReader();
          fileReader.onload = (e) => resolve(fileReader.result);
          fileReader.readAsDataURL(this.fichier_audio);
        });

        let serialisation = JSON.stringify( { 
          version_api: 1,
          config: this.modules, 
          fichier: audio_base64 
        });

        return serialisation;
      },
      exporter: function () {
        this.fonofone.exporter(this.serialiser());
      },
      update_fichier_audio: function (fichier) {
        this.fichier_audio = fichier;
        this.wavesurfer.load(this.url_fichier_audio);
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
      grille_id: function () {
        return `grille-${this.id}`;
      },
      grille_wrapper_id: function () {
        return `grille-wrapper-${this.id}`;
      },
      waveform_id: function () {
        return `waveform-${this.id}`;
      },
      url_fichier_audio: function () {
        return this.fichier_audio ? URL.createObjectURL(this.fichier_audio) : null;
      }
    },
    mounted: function () {
      this.init_filepond();
      this.init_wavesurfer();
      //this.configurer(); // TODO

      this.repaint(); // Hack pour vue-draggable-resizable
    },
    i18n
  });
}

export default ApplicationFonofone;

