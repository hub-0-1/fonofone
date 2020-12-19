import Vue from 'vue';
import VueI18n from 'vue-i18n';
import WaveSurfer from 'wavesurfer';
import * as FilePond from 'filepond';
import { fabric } from "fabric";

import template_fnfn from './partials/fonofone';

import i18n from './traductions.js';
import 'filepond/dist/filepond.min.css';

Vue.use(VueI18n);

let ApplicationFonofone = function (id, fonofone) {
  return new Vue({
    el: "#" + id,
    template: template_fnfn,
    data: {
      fonofone: fonofone,
      configuration: { triangle: 0 },
      panneaux: {
        importation: false,
        grille: true,
        waveform: true,
        menu: false,
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
          } else if (e.detail) { // TODO Changer la condition
            this.fonofone.importer (e.detail.file.file);
          } else {
            throw "type de fichier non valide";
          }
        });
      },
      init_wavesurfer: function () {
        
        // Representation graphique du son
        this.wavesurfer = WaveSurfer.create({
          container: '#waveform',
          waveColor: 'violet',
          progressColor: 'purple',
          height: 100
        });

        // Si configure
        if(this.url_fichier_audio) this.wavesurfer.load(this.url_fichier_audio); // TODO Pas beau ici, amener dans configurer
      },
      init_fabric: function () { // Style https://github.com/pixolith/fabricjs-customise-controls-extension

        // Grille de manipulation
        this.canvas = new fabric.Canvas('grille', {});
        this.update_canvas_width();

        var rect = new fabric.Rect({
          left: 100,
          top: 100,
          fill: 'red',
          width: 20,
          height: 20
        });
        this.canvas.add(rect);
      },
      toggle_menu: function () {
        this.panneaux.menu = !this.panneaux.menu;
      },
      toggle_importation: function () {
        this.panneaux.importation = !this.panneaux.importation;
      },
      configurer: function (archive) {
        this.update_fichier_audio(archive.fichier);
        // TODO appliquer la configuration
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
      update_canvas_width: function () {
        this.canvas.setWidth(this.$refs.grille_wrapper.offsetWidth);
        this.canvas.setHeight(this.$refs.grille_wrapper.offsetHeight);
      },
      repaint: function () {
        this.update_canvas_width();
      }
    },
    computed: {
      url_fichier_audio: function () {
        return this.fichier_audio ? URL.createObjectURL(this.fichier_audio) : null;
      }
    },
    mounted: function () {
      this.init_filepond();
      this.init_wavesurfer();
      this.init_fabric();
      //this.configurer(); // TODO
    },
    i18n
  });
}

export default ApplicationFonofone;

