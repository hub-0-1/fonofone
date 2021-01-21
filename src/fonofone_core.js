import _ from 'lodash';
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

// TODO Fusionner dans une classe avec Fonofone
// Creer fonction encode_audio_64, decode_audio_64

let ApplicationFonofone = function (id, fonofone, archive) {
  return new Vue({
    el: "#" + id,
    template: template_fnfn,
    components: {
      "selecteur": FNFNSelecteur,
      "toggle-button": ToggleButton
    },
    data: {
      id, fonofone, archive,
      fichier_audio: null,
      mode_edition: true,
      panneaux: {
        importation: false,
        grille: true,
        waveform: true,
        menu: true,
        valeurs_modules: false,
      },
      outils: {
        filepond: null,
        wavesurfer: null
      },
      modules: {
        volume: {
          actif: false,
          position: {},
          valeur: null
        },
        arpegiateur: {
          actif: false,
          position: {},
          valeur: null
        },
        selecteur: {
          actif: true,
          disposition: {}, // En % de la grille
          valeur: { x: 0, y: 0 }
        }
      }
    },
    methods: {
      init_filepond: function () {

        // Upload fichiers
        this.outils.filepond = FilePond.create({ 
          name: 'filepond',
          credits: false
        });

        this.$refs.filepond.appendChild(this.outils.filepond.element);

        let filepond = this.$refs.filepond.firstChild;
        filepond.addEventListener('FilePond:addfile', e => { 
          let fichier = e.detail.file;

          if(fichier.fileType.match(/audio/)) {
            this.update_fichier_audio(fichier.file);
            this.panneaux.importation = false;
          } else if (fichier.fileExtension == "fnfn") {
            this.importer(fichier.file);
            this.panneaux.importation = false;
          } else {
            throw "type de fichier non valide";
          }
        });
      },
      init_wavesurfer: function () {

        // TODO connexion a un audio context : https://stackoverflow.com/questions/61967312/using-a-separate-audiocontext-scriptprocessor-node-in-wavesurfer#62187178
        
        // Representation graphique du son
        this.outils.wavesurfer = WaveSurfer.create({
          container: `#${this.waveform_id}`,
          waveColor: 'violet',
          progressColor: 'purple',
          height: 100
        });
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
      importer: function (blob) {
        let archive_serialisee = new Promise((resolve) => {
          let fileReader = new FileReader();
          fileReader.onload = (e) => resolve(fileReader.result);
          fileReader.readAsText(blob);
        });

        // TODO terminer importation
        archive_serialisee.then((archive) => {
          archive = JSON.parse(archive);
          this.archive = archive;
          this.charger_modules();
          this.charger_audio();
        });
      },
      charger_modules: function () {
        _.each(this.archive.config, (value, key) => {
          this.modules[key] = this.archive.config[key];
        });
      },
      charger_audio: async function () {
        this.fichier_audio = await (await fetch(archive.fichier)).blob();
        this.outils.wavesurfer.load(this.url_fichier_audio);
      },
      exporter: function () {
        this.fonofone.exporter(this.serialiser());
      },
      jouer: function () {
        this.outils.wavesurfer.play();
      },
      update_fichier_audio: function (fichier) {
        this.fichier_audio = fichier;
        this.outils.wavesurfer.load(this.url_fichier_audio);
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
      },
      url_fichier_audio: function () {
        return URL.createObjectURL(this.fichier_audio);
      }
    },
    created: function () {
      this.charger_modules();
    },
    mounted: function () {
      this.init_filepond();
      this.init_wavesurfer();
      this.charger_audio();
      this.repaint();
    },
    i18n
  });
}

export default ApplicationFonofone;

