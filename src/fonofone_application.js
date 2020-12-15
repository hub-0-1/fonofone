import Vue from 'vue';
import VueI18n from 'vue-i18n';
import WaveSurfer from 'wavesurfer';
import * as FilePond from 'filepond';

import template_fnfn from './partials/fonofone';

import i18n from './traductions.js';
import 'filepond/dist/filepond.min.css';

Vue.use(VueI18n);

let ApplicationFonofone = function (id) {
  return new Vue({
    el: "#" + id,
    template: template_fnfn,
    data: {
      fichier_audio: null // Ou definit si chargement
    },
    methods: {
      emballer: function () { // TODO expoter le fichier audio + json config
        let blob = new Blob([this.fichier_audio], {type : 'audio/ogg'});
        console.log(blob);
        return blob;
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
