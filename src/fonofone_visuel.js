import Vue from 'vue';
import VueI18n from 'vue-i18n';
import WaveSurfer from 'wavesurfer';
import * as FilePond from 'filepond';

import template_fnfn from './templates/fonofone';

import i18n from './traductions.js';
import 'filepond/dist/filepond.min.css';

import FNFNSelecteur from './modules/selecteur.js';

Vue.use(VueI18n);
// Interessant : https://vuetifyjs.com/en/components/lazy/#usage

let ApplicationFonofone = function (id, fonofone) {
  return new Vue({
    el: "#" + id,
    template: template_fnfn,
    components: {
      "fnfn-selecteur": FNFNSelecteur
    },
    data: {
      id: id,
      fonofone: fonofone,
      configuration: { triangle: 0 },
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
      toggle_menu: function () {
        this.panneaux.menu = !this.panneaux.menu;
      },
      toggle_importation: function () {
        this.panneaux.importation = !this.panneaux.importation;
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
          config: this.configuration, 
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
      repaint: function () { } // Appele lorsque la fenetre change de dimension
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
    },
    i18n
  });
}

export default ApplicationFonofone;

