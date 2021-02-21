/* 
 * TODO creer une configuration 0 qui contient tous les modules, mais pas les sons
 * Format standard des modules : {
 *  disposition: { top, left, width, height }, // Notee en pourcentage
 *  valeur: null
 * }
 *
 */

import Vue from 'vue';
import _ from 'lodash';
import { saveAs } from 'file-saver';

import Bouton from './bouton.js';
import Filepond from './mixins/filepond.js';

import Mixer from './mixer/mixer.js';
import Filtre from './modules/filtre.js';
import Metronome from './modules/metronome.js';
import Reverberation from './modules/reverberation.js';
import Selecteur from './modules/selecteur.js';
import Volume from './modules/volume.js';
import Vitesse from './modules/vitesse.js';

// Configuration de base pour l'application
import Configuration from './configuration.js';

// Icones
import Record from './images/record.svg';
import Folder from './images/icon-folder.svg';
import Fleche from './images/arrow.svg';

// Traduction
import VueI18n from 'vue-i18n';
import i18n from './traductions.js';
Vue.use(VueI18n);

export default function (id, archive, ctx_audio) {
  return new Vue({
    el: "#" + id,
    mixins: [Filepond],
    components: {
      "Bouton": Bouton,
      "filtre": Filtre,
      "metronome": Metronome,
      "reverberation": Reverberation,
      "selecteur": Selecteur,
      "volume": Volume,
      "vitesse": Vitesse
    },
    data: {
      id, archive, ctx_audio,
      configuration: Configuration,
      fichier_audio: null, // TODO inutile, enlever ca
      mode_affichage: "colonne", // "grille" ou "colonne"
      mode_importation: false,
      mixer: null,
      outils: {
        filepond: null
      }
    },
    i18n,
    methods: {
      enregistrer: function () {
        throw "TODO";
      },
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
    mounted: function () {

      // Initialisation de Filepond par les mixins

      // Mode affichage
      if(this.$refs.fonofone.offsetWidth > this.configuration.min_width_grille) {
        this.mode_affichage = "grille";
      }

      this.mixer = new Mixer(this.waveform_id, this.id, this.ctx_audio);
      this.importer(this.archive).then(() => {
        this.synchroniser_modules();
        this.repaint();
        this.mixer.chargement = false;

        // Ajouter les breaks points pour l'affichage en mode colonne
        // TODO compter les enfants
        // Selon la largeur, diviser en colonnes
        let children = this.$refs.mixer.children;
      });
    },
    template: `
      <div :id="id" class="fonofone" ref="fonofone">
        <header>
          <div class="nom-archive">
            <bouton src="${Folder}" @click.native="mode_importation = !mode_importation"></bouton>
            Archive
          </div>
          <div :id="waveform_id" class="wavesurfer"></div>
          <div class="menu">
            <bouton src="${Record}" @click.native="enregistrer"></bouton>
          </div>
        </header>
        <main>
          <div v-show="!mode_importation" class="mixer" :class="mode_affichage" ref="mixer">
            <component v-for="(module, key) in archive.config" :is="key" :key="key" v-bind.sync="module" :modifiable="mode_affichage == 'grille'" :class="key" :ref="key"></component>
          </div>
          <div v-show="mode_importation" class="ecran-importation">
            <div class="background-importation">
              <div class="fenetre-importation">
                <header>Liste des sons</header>
                <main>
                  <ul>
                    <li v-for="item in configuration.sons">{{ item }}</li>
                  </ul>
                  <div class="importation">
                    <h3>Importation</h3>
                    <div ref="filepond"></div>
                  </div>
                </main>
                <footer>
                  <div>Enregistrer un son</div>
                  <button @click="exporter()">Exporter</button>
                </footer>
              </div>
            </div>
          </div>
        </main>
        <footer></footer>
      </div>`
  });
}
