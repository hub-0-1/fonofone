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
import Globales from './globales.js';

// Icones
import Record from './images/record.svg';
import Folder from './images/icon-folder.svg';
import Fleche from './images/arrow.svg';
import Jouer from './images/jouer.svg';
import Loop from './images/loop.svg';
import Sens from './images/fleche-sens.svg';
import Crop from './images/crop.svg';
import Export from './images/export.svg';
import Import from './images/import.svg';

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
      configuration: {},
      globales: Globales,
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
        this.mixer.enregistrer().then((buffer) => {
          this.globales.sons.push({ buffer: buffer, nom: Date.now().toString() });
        });
      },
      exporter: function () {
        this.serialiser().then((archive) => { 
          saveAs(new Blob([archive]), "archive.fnfn"); 
        });
      },
      serialiser: async function () {
        return JSON.stringify(this.configuration);
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

          this.configuration = JSON.parse(archive_serialisee);
          fetch(this.configuration.fichier).then((response) => {
            return response.arrayBuffer();
          }).then((buffer) => {
            return this.mixer.charger_buffer(buffer)
          }).then(() => { 
            resolve(this.configuration);
          });
        });
      },
      base64_a_buffer: async function (base64) {
        return await (await fetch(base64)).arrayBuffer();
      },
      synchroniser_modules: function () {
        _.each(this.configuration.modules, (v, key) => {
          this.$watch(`configuration.modules.${key}.valeur`, (valeur) => { // https://vuejs.org/v2/api/#vm-watch
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
      },
      crop: function () {
        this.mixer.crop();
        this.reset_selecteur();
      },
      reset_selecteur: function () {
        this.configuration.modules.selecteur.valeur = { debut: 0, longueur: 1 };
      },
      // TODO Mettre watchers
      toggle_loop: function () {
        this.configuration.parametres.loop = !this.configuration.parametres.loop;
        this.mixer.set_loop(this.configuration.parametres.loop);
      },
      toggle_sens: function () {
        this.configuration.parametres.sens *= -1;
        this.mixer.set_sens(this.configuration.parametres.sens);
      },
      jouer: function () {
        this.ctx_audio.resume().then(() => {
          this.mixer.jouer();
        });
      },
      charger_son: function (son) {
        if(son.buffer) {
          this.mixer.charger_buffer(son.buffer).then(() => {
            this.mode_importation = false;
            this.reset_selecteur();
          });
        }
        else {
          fetch(son.url, { mode: 'cors' }).then((response) => {
            return response.arrayBuffer();
          }).then((buffer) => {
            return this.mixer.charger_buffer(buffer);
          }).then(() => {
            this.mode_importation = false;
            this.reset_selecteur();
          }).catch((e) => {
            throw e;
          });
        }
      }
    },
    computed: {
      waveform_id: function () { return `waveform-${this.id}`; }
    },
    mounted: function () {

      // Initialisation de Filepond par les mixins

      // Mode affichage
      /*if(this.$refs.fonofone.offsetWidth > this.globales.min_width_grille) {
        this.mode_affichage = "grille";
      }*/

      this.mixer = new Mixer(this.waveform_id, this.id, this.ctx_audio);

      this.importer(this.archive).then((configuration) => {
        this.mixer.set_loop(configuration.parametres.loop);
        this.mixer.set_sens(configuration.parametres.sens);
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
        <menu>
          <bouton src="${Import}" @click.native="mode_importation = !mode_importation"></bouton>
          <bouton src="${Export}" @click.native="exporter"></bouton>
        </menu>
        <section v-show="!mode_importation" class="app-fonofone">
          <header>
            <div class="nom-archive">
              <bouton src="${Folder}" @click.native="mode_importation = !mode_importation"></bouton>
              Archive
            </div>
            <div :id="waveform_id" class="wavesurfer"></div>
            <div class="menu">
              <bouton src="${Record}"></bouton>
              <bouton src="${Jouer}" @click.native="jouer"></bouton>
              <bouton src="${Loop}" @click.native="toggle_loop"></bouton>
              <bouton src="${Sens}" @click.native="toggle_sens"></bouton>
              <bouton src="${Crop}" @click.native="crop"></bouton>
            </div>
          </header>
          <main>
            <div class="mixer" :class="mode_affichage" ref="mixer">
              <component v-for="(module, key) in configuration.modules" :is="key" :key="key" v-bind.sync="module" :modifiable="mode_affichage == 'grille'" :class="key" :ref="key"></component>
            </div>
          </main>
        </section>
        <div v-show="mode_importation" class="ecran-importation">
          <div class="background-importation">
            <div class="fenetre-importation">
              <h3>Liste des sons</h3>
              <main>
                <ul>
                  <li v-for="son in globales.sons" @click="charger_son(son)">{{ son.nom }}</li>
                </ul>
                <h3>Importation</h3>
                <div ref="filepond"></div>
              </main>
              <h3 @click="enregistrer">Enregistrer un son</h3>
            </div>
          </div>
        </div>
      </div>`
  });
}
