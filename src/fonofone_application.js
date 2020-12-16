import Vue from 'vue';
import VueI18n from 'vue-i18n';
import WaveSurfer from 'wavesurfer';
import * as FilePond from 'filepond';

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
      fichier_audio: null // Ou definit si chargement
    },
    methods: {
      serialiser: async function () { // TODO expoter le fichier audio + json config
        let audio_base64 = await new Promise((resolve) => {
          let fileReader = new FileReader();
          fileReader.onload = (e) => resolve(fileReader.result);
          fileReader.readAsDataURL(this.fichier_audio);
        });

        let serialisation = JSON.stringify( { 
          config: this.configuration, 
          fichier: audio_base64 
        });

        return serialisation;
      },
      exporter: function () {
        this.fonofone.exporter(this.serialiser());
      },
      update_fichier_audio (fichier) {
        this.fichier_audio = fichier;
        this.wavesurfer.load(this.url_fichier_audio);
      }
    },
    computed: {
      url_fichier_audio: function () {
        return this.fichier_audio ? URL.createObjectURL(this.fichier_audio) : null;
      }
    },
    mounted: function () {

      // init Upload fichiers
      let pond = FilePond.create({ name: 'filepond' });
      this.$refs.filepond.appendChild(pond.element);

      let filepond = this.$refs.filepond.firstChild;
      filepond.addEventListener('FilePond:addfile', e => { 

        if(!e.detail.file.fileType.match(/audio/)) {
          throw "type de fichier non valide";
        }

        this.update_fichier_audio(e.detail.file.file);
      });

      // Init son
      this.wavesurfer = WaveSurfer.create({
        container: '#waveform',
        waveColor: 'violet',
        progressColor: 'purple'
      });

      // Si configure
      if(this.url_fichier_audio) this.wavesurfer.load(this.url_fichier_audio);
    },
    i18n
  });
}

export default ApplicationFonofone;

