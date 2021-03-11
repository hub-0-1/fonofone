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
import toWav from 'audiobuffer-to-wav';

import Filepond from './mixins/filepond.js';
import Enregistreur from './enregistreur.js';

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
import Micro from './images/micro.svg';

// Traduction
import VueI18n from 'vue-i18n';
import i18n from './traductions.js';
Vue.use(VueI18n);

export default function (id, archive, ctx_audio) {
  return new Vue({
    el: "#" + id,
    mixins: [Filepond],
    components: {
      "filtre": Filtre,
      "metronome": Metronome,
      "reverberation": Reverberation,
      "selecteur": Selecteur,
      "volume": Volume,
      "vitesse": Vitesse
    },
    data: {
      id, archive, ctx_audio,
      configuration: {parametres:{}},
      globales: Globales,
      mode_affichage: "colonne", // "grille" ou "colonne"
      mode_importation: false,
      tracks_actives: false,
      enregistrement: {
        encours: false,
        enregistreur: null
      },
      mixer: {session:{}},
      outils: {
        filepond: null
      }
    },
    i18n,
    methods: {
      exporter: function () {
        this.serialiser().then((archive) => { 
          saveAs(new Blob([archive]), `${this.configuration.parametres.nom}.fnfn`);
        });
      },
      serialiser: function () {
        return new Promise((resolve) => {
          let audio_blob = new Blob([toWav(this.mixer.audio_buffer)]);
          blob2base64(audio_blob).then((base64) => {
            let archive = {
              parametres: this.configuration.parametres,
              modules: this.configuration.modules,
              fichier: base64
            };
            resolve(JSON.stringify(archive));
          });
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
            return response.blob();
          }).then((blob) => {
            return this.mixer.charger_blob(blob);
          }).then(() => { 
            resolve(this.configuration);
          });
        });
      },
      synchroniser_modules: function () {
        _.each(this.configuration.modules, (v, key) => {
          this.$watch(`configuration.modules.${key}.valeur`, (valeur) => { // https://vuejs.org/v2/api/#vm-watch
            this.mixer[`set_${key}`](valeur);
          }, {deep: true, immediate: true});
        });
      },
      crop: function () {
        this.mixer.crop();
        this.reset_selecteur();
      },
      reset_selecteur: function () {
        this.configuration.modules.selecteur.valeur = { debut: 0, longueur: 1 };
      },
      toggle_loop: function () {
        this.configuration.parametres.loop = !this.configuration.parametres.loop;
        this.mixer.set_loop(this.configuration.parametres.loop);
      },
      toggle_sens: function () {
        this.configuration.parametres.sens *= -1;
        this.mixer.set_sens(this.configuration.parametres.sens);
      },
      toggle_pause: function () {
        if(this.playing) {
          this.mixer.set_loop(false);
          this.configuration.parametres.loop = false;
        }
        this.mixer.toggle_pause();
      },
      repaint: function () {
        // TODO this.mixer.paint();
      },
      toggle_enregistrement: function () {
        this.get_enregistreur().then((enregistreur) => {
          if(!this.enregistrement.encours) {
            enregistreur.debuter();
          } else {
            enregistreur.terminer().then((blob) => {
              this.globales.sons.push({ nom: `son_${Date.now().toString()}`, blob });
            });
          } 
          this.enregistrement.encours = !this.enregistrement.encours;
        });
      },
      toggle_session: function () {
        if(this.mixer.session.encours) {
          this.mixer.terminer_session().then((blob) => { saveAs(blob, `session_${Date.now().toString()}.webm`); });
        } else {
          this.mixer.debuter_session();
        }
        this.mixer.session.encours = !this.mixer.session.encours;
      },
      charger_son: function (son) {
        if(son.blob) {
          this.mixer.charger_blob(son.blob).then(() => {
            this.mode_importation = false;
            this.reset_selecteur();
          });
        }
        else {
          fetch(son.url, { mode: 'cors' }).then((response) => {
            return response.blob();
          }).then((blob) => {
            return this.mixer.charger_blob(blob);
          }).then(() => {
            this.mode_importation = false;
            this.reset_selecteur();
          }).catch((e) => {
            throw e;
          });
        }
      },
      get_enregistreur: function () {
        return new Promise ((resolve) => {

          // S'il est deja initialise
          if(this.enregistrement.enregistreur) resolve(this.enregistrement.enregistreur);

          // Sinon
          else {
            navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
              this.enregistrement.enregistreur = new Enregistreur(stream);
              resolve(this.enregistrement.enregistreur);
            });      
          }
        });
      }
    },
    watch: {
      mixer: {
        handler: function (mixer) { 
          this.tracks_actives = (mixer.tracks.length > 0 
            || (mixer.parametres.metronome_actif && mixer.parametres.loop)
          );
        },
        deep: true
      }
    },
    computed: {
      waveform_id: function () { return `waveform-${this.id}`; },
      playing: function () { return this.tracks_actives }
    },
    mounted: function () {

      // Initialisation de Filepond par les mixins

      // Mode affichage
      /*if(this.$refs.fonofone.offsetWidth > this.globales.min_width_grille) {
        this.mode_affichage = "grille";
      }*/

      window.addEventListener("resize", this.repaint);

      this.mixer = new Mixer(this.waveform_id, this.id, this.ctx_audio);

      this.importer(this.archive).then((configuration) => {
        this.mixer.set_loop(configuration.parametres.loop);
        this.mixer.set_sens(configuration.parametres.sens);
        this.synchroniser_modules();
        this.mixer.chargement = false;

        // TODO Ajouter les breaks points pour l'affichage en mode colonne
        // compter les enfants, sSelon la largeur, diviser en colonnes
        let children = this.$refs.mixer.children;
      });
    },
    template: `
      <div :id="id" class="fonofone" ref="fonofone">
        <menu>
          <img src="${Import}" @click="mode_importation = !mode_importation">
          <img src="${Export}" @click="exporter">
        </menu>
        <section v-show="!mode_importation" class="app-fonofone">
          <header>
            <div class="nom-archive">
              <img src="${Folder}" @click="mode_importation = !mode_importation"/>
              <input v-model="configuration.parametres.nom" class="texte-nom-archive" placeholder="Archive"/>
            </div>
            <div :id="waveform_id" class="wavesurfer" @click.prevent></div>
            <div class="menu">
              <img src="${Record}" class="icone session" :class="{actif: mixer.session.encours}" @click="toggle_session"/>
              <img src="${Jouer}" class="icone pause" :class="{actif: playing}" @click="toggle_pause"/>
              <img src="${Loop}" class="icone loop" :class="{actif: configuration.parametres.loop}" @click="toggle_loop"/>
              <img src="${Sens}" class="icone sens" :class="{actif: configuration.parametres.sens > 0}" @click="toggle_sens"/>
              <img src="${Crop}" class="icone" @click="crop"/>
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
                  <li v-for="son in globales.sons" @click="charger_son(son)">
                    <input @click.stop v-model="son.nom" type="text"/>
                  </li>
                </ul>
                <h3>Importation</h3>
                <div ref="filepond"></div>
              </main>
              <h3 @click="toggle_enregistrement" :class="{actif: enregistrement.encours}"><img src="${Micro}">Enregistrer un son</h3>
            </div>
          </div>
        </div>
      </div>`
  });
}

function buffer2base64 (arrayBuffer) {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(arrayBuffer)))
}

// https://stackoverflow.com/questions/18650168/convert-blob-to-base64
function blob2base64 (blob) {
  return new Promise ((resolve) => {
    let reader = new FileReader();
    reader.readAsDataURL(blob); 
    reader.onloadend = function() { resolve(reader.result); };                
  });
}
