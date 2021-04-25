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
import WaveSurfer from 'wavesurfer.js';
import Regions from 'wavesurfer.js/dist/plugin/wavesurfer.regions.min.js';

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
import Config0 from './configurations/Fonofone.fnfn';

// Icones
import './style.less';
import Record from './images/record.svg';
import Reload from './images/reload.png';
import Folder from './images/icon-folder.svg';
import Fleche from './images/arrow.svg';
import Jouer from './images/jouer.svg';
import JouerActif from './images/jouer-actif.svg';
import Loop from './images/btn-loop.svg';
import LoopActif from './images/btn-loop-actif.svg';
import Sens from './images/fleche-sens.svg';
import Crop from './images/crop.svg';
import Solo from './images/solo.svg';
import Export from './images/export.svg';
import Import from './images/folder-open.svg';
import Micro from './images/micro.svg';
import ModeMix from './images/mode_mix.svg';
import ModePic from './images/mode_pic.svg';

// Traduction
import VueI18n from 'vue-i18n';
import i18n from './traductions.js';
Vue.use(VueI18n);

export default {
  mixins: [Filepond],
  components: {
    "filtre": Filtre,
    "metronome": Metronome,
    "reverberation": Reverberation,
    "selecteur": Selecteur,
    "volume": Volume,
    "vitesse": Vitesse
  },
  props: ['id', 'archive', 'ctx_audio', 'noeud_sortie', 'integration_fonoimage'],
  data: function () {
    return {
      configuration: {parametres:{}},
      globales: Globales,
      fonoimage: {
        integration: (this.integration_fonoimage || false),
        mode: 'mix',
        solo: false
      },
      mode_affichage: "colonne", // "grille" ou "colonne"
      mode_importation: false,
      dossier_importation: null,
      mode_selection_son: false,
      enregistrement: {
        encours: false,
        enregistreur: null
      },
      mixer: null,
      filepond: null,
      wavesurfer: null,
      wavesurfer_region: null
    };
  },
  i18n,
  methods: {

    // IMPORT / EXPORT
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
            sources: this.configuration.sources,
            fichier: base64,
          };
          resolve(JSON.stringify(archive));
        });
      });
    },
    importer: function (fichier) {
      return new Promise (async (resolve) => {
        if(fichier instanceof Blob) {
          fichier = await new Promise((resolve) => {
            let fileReader = new FileReader();
            fileReader.onload = (e) => resolve(fileReader.result);
            fileReader.readAsText(fichier);
          });
        }

        this.configuration = JSON.parse(fichier);
        let source_active = _.find(this.configuration.sources, "actif");

        // TODO Traiter cas url
        fetch(source_active.fichier).then((response) => {
          return response.blob();
        }).then((blob) => {
          return this.mixer.charger_blob(blob);
        }).then(() => { 
          this.paint();
          resolve(this.configuration);
        });
      });
    },
    appliquer_configuration: function (configuration) {
      this.mixer.set_loop(configuration.parametres.loop);
      this.mixer.set_sens(configuration.parametres.sens);
      this.synchroniser_modules();
      this.paint();
    },
    synchroniser_modules: function () {
      _.each(this.configuration.modules, (v, key) => {
        this.$watch(`configuration.modules.${key}.valeur`, (valeur) => { // https://vuejs.org/v2/api/#vm-watch
          this.mixer[`set_${key}`](valeur);
        }, {deep: true, immediate: true});
      });
    },
    charger_son: function (son) {
      if(son.blob) {
        this.mixer.charger_blob(son.blob).then(() => {
          this.mode_selection_son = false;
          this.reset_selecteur();
        });
      }
      else {
        fetch(son.url, { mode: 'cors' }).then((response) => {
          return response.blob();
        }).then((blob) => {
          return this.mixer.charger_blob(blob);
        }).then(() => {
          this.mode_selection_son = false;
          this.reset_selecteur();
        }).catch((e) => {
          throw e;
        });
      }
    },
    charger_dossier: function (dossier) {
      this.dossier_importation = dossier;
      console.log(dossier);
    },

    // CONTROLLEURS
    force_play: function () {
      this.set_loop(true);
      this.mixer.lancer();
    },
    reset_selecteur: function () {
      this.configuration.modules.selecteur.valeur = { debut: 0, longueur: 1 };
      this.paint();
    },
    toggle_loop: function () {
      this.set_loop(!this.mixer.etat.loop);
    },
    set_loop: function (val) {
      this.mixer.set_loop(val);
    },
    toggle_solo: function () {
      this.fonoimage.solo = !this.fonoimage.solo;
    },
    toggle_sens: function () {
      this.configuration.parametres.sens *= -1;
      this.mixer.set_sens(this.configuration.parametres.sens);
    },
    toggle_pause: function () {
      this.mixer.etat.jouer ? this.arreter() : this.jouer();
    },
    jouer: function () {
      this.mixer.toggle_pause();
    },
    arreter: function () {
      this.mixer.toggle_pause();
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
      if(this.mixer.etat.en_session) {
        this.mixer.terminer_session().then((blob) => { 
          if(blob) saveAs(blob, `${this.configuration.parametres.nom} ${new Date().toLocaleString()}.wav`); });
      } else {
        this.mixer.debuter_session();
      }
      this.mixer.etat.en_session = !this.mixer.etat.en_session;
    },
    toggle_mode_fonoimage: function () {
      this.fonoimage.mode = this.fonoimage.mode == 'pic' ? 'mix' : 'pic';
      this.$emit('update:mode', this.fonoimage.mode);
    },
    reset: function () {
      this.importer(JSON.stringify(Config0)).then(() => {
        _.each(this.configuration.modules, (v, key) => {
          let module = this.$refs[key][0];
          if(module.charger_props) module.charger_props();
        });
      })
    },
    
    // UI
    paint: function () {

      // Largeur modules
      let mixer = this.$refs.mixer;
      let nb_colonnes = Math.ceil(mixer.offsetWidth / Globales.max_width_colonne);
      mixer.style.columnCount = nb_colonnes;

      // Wavesurfer
      if(this.wavesurfer) {
        this.wavesurfer.destroy();
        this.wavesurfer = null;
      }

      // Afficher
      this.$nextTick(() => {

        this.wavesurfer = WaveSurfer.create({

          container: `#${this.waveform_id}`,
          waveColor: '#418ACA',
          height: 100, // TODO determiner par CSS si possible
          plugins: [ Regions.create({ }) ]
        });
        this.wavesurfer.loadDecodedBuffer(this.mixer.audio_buffer);

        // TODO Ajouter temps min
        this.wavesurfer.on('region-updated', (region) => {
          let start = region.start / this.mixer.audio_buffer.duration;
          let end = region.end / this.mixer.audio_buffer.duration;

          this.$refs.selecteur[0].set_plage(start, end - start);
          this.$nextTick(() => { this.paint_regions(); });
        });

        this.wavesurfer_region = this.wavesurfer.addRegion({
          id: `wavesurfer-region-${this.id}`,
          start: this.mixer.parametres.debut,
          end: this.mixer.parametres.debut + this.mixer.parametres.longueur,
          color: '#323232' 
        });
        this.paint_regions();

        this.$refs.metronome[0].update_font_size_bpm();
      });
    },
    paint_regions: function () {
      if(!this.wavesurfer_region) return;
      this.wavesurfer_region.start = this.mixer.parametres.debut;
      this.wavesurfer_region.end = this.mixer.parametres.debut + this.mixer.parametres.longueur;
      this.wavesurfer_region.updateRender();
    },
    
    // OUTILS
    crop: function () {
      this.mixer.crop();
      this.wavesurfer.loadDecodedBuffer(this.mixer.audio_buffer);
      this.reset_selecteur();
    },
    get_enregistreur: function () {
      return new Promise ((resolve) => {

        // S'il est deja initialise
        if(this.enregistrement.enregistreur) resolve(this.enregistrement.enregistreur);

        // Sinon
        else {
          navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
            this.enregistrement.enregistreur = new Enregistreur(this.ctx_audio, stream);
            resolve(this.enregistrement.enregistreur);
          });      
        }
      });
    }
  },
  watch: {
    'configuration.modules.selecteur': {
      handler: function (config) {
        this.paint_regions();
      },
      deep: true
    }
  },
  computed: {
    waveform_id: function () { return `waveform-${this.id}`; },
    liste_dossiers_sons: function () { return _.uniq(_.map(this.configuration.sources, source => source.dossier)); },
    liste_sons: function () { return _.filter(this.configuration.sources, {dossier: this.dossier_importation}); }
  },
  created: function () {
    this.mixer = new Mixer(this);
  },
  mounted: function () {

    // Initialisation de Filepond par les mixins
    this.init_filepond(this.$refs.filepond_son, (fichier) => { 

      // Importation de nouveau fichier audio
      if(fichier.fileType.match(/audio|webm/)) {
        new Response(fichier.file).blob().then((blob) => {
          this.globales.sons.push({ nom: fichier.filenameWithoutExtension, blob: blob });
        }); 
      }
      else {
        this.mode_selection_son = false;
        throw "type de fichier non valide";
      }
    });

    this.init_filepond(this.$refs.filepond_archive, (fichier) => { 

      this.mode_importation = false;

      if (fichier.fileExtension == "fnfn") {
        this.importer(fichier.file).then((configuration) => {
          this.appliquer_configuration(configuration);
        });
      } else {
        throw "type de fichier non valide";
        this.mode_importation = false;
      }
    });

    // Mode affichage
    /*if(this.$refs.fonofone.offsetWidth > this.globales.min_width_grille) {
        this.mode_affichage = "grille";
      }*/

    window.addEventListener("resize", this.paint);

    this.importer(this.archive).then((configuration) => {
      this.appliquer_configuration(configuration);
      this.mixer.etat.chargement = false;
    });
  },
  template: `
      <div :id="id" class="fonofone" ref="fonofone">
        <menu>
          <img src="${Reload}" class="invert" @click="reset">
          <img src="${Import}" @click="mode_importation = !mode_importation">
          <img src="${Export}" @click="exporter">
        </menu>
        <section v-show="!mode_selection_son && !mode_importation" class="app-fonofone">
          <header>
            <div class="nom-archive">
              <img src="${Folder}" @click="mode_selection_son = !mode_selection_son"/>
              <input v-model="configuration.parametres.nom" class="titre texte-nom-archive" placeholder="Archive"/>
            </div>
            <div :id="waveform_id" class="wavesurfer"></div>
            <div class="menu-controlleurs">
              <div class="gauche">
                <img :src="mixer.etat.jouer ? '${JouerActif}' : '${Jouer}'" class="icone pause" :class="{actif: mixer.etat.jouer}" @click="toggle_pause"/>
                <img v-if="fonoimage.integration" src="${Solo}" class="icone solo" :class="{actif: fonoimage.solo}" @click="toggle_solo"/>
                <img :src="mixer.etat.loop ? '${LoopActif}' : '${Loop}'" class="icone loop" @click="toggle_loop"/>
                <img src="${Sens}" class="icone sens" :class="{actif: configuration.parametres.sens > 0}" @click="toggle_sens"/>
                <img src="${Record}" class="icone session" :class="{actif: mixer.etat.en_session}" @click="toggle_session"/>
                <span v-show="mixer.etat.en_session && !mixer.etat.en_enregistrement">{{ $t('session.activer') }}</span>
                <img src="${Crop}" class="icone" @click="crop"/>
              </div>
              <div v-if="fonoimage.integration" class="droite">
                <img src="${ModeMix}" class="icone" @click="toggle_mode_fonoimage"/>
                <img src="${ModePic}" class="icone" @click="toggle_mode_fonoimage"/>
              </div>
            </div>
          </header>
          <main>
            <div class="mixer" :class="mode_affichage" ref="mixer">
              <component v-for="(module, key) in configuration.modules" :is="key" :key="key" :valeur="module.valeur" :disposition="module.disposition" :modifiable="mode_affichage == 'grille'" @update:valeur="module.valeur = $event" @update:disposition="module.disposition = $event" :class="key" :ref="key"></component>
            </div>
          </main>
        </section>
        <div v-show="mode_importation" class="ecran-importation">
          <div class="background-importation">
            <div class="fenetre-importation">
              <h3 class="titre">Importer une archive Fonofone</h3>
              <div class="wrapper-filepond" ref="filepond_archive"></div>
            </div>
          </div>
        </div>
        <div v-show="mode_selection_son" class="ecran-selection-son">
          <div class="background-selection-son">
            <div class="fenetre-selection-son">
              <h3 class="titre">
                <img src="${Folder}" @click="mode_selection_son = !mode_selection_son"/>
                Liste des sons
              </h3>
              <main>
                <ul class="dossiers">
                  <li v-for="dossier in liste_dossiers_sons" @click="charger_dossier(dossier)">
                    <span>{{ dossier }}</span>
                  </li>
                </ul>
                <ul class="sons">
                  <li v-for="son in liste_sons" @click="charger_son(son)">
                    <input @click.stop :value="son.id" type="text" :disabled="!son.local"/>
                  </li>
                </ul>
                <h3 class="titre">Importer un son</h3>
                <div class="wrapper-filepond" ref="filepond_son"></div>
              </main>
              <h3 class="titre" @click="toggle_enregistrement" :class="{actif: enregistrement.encours}"><img src="${Micro}">Enregistrer un son</h3>
            </div>
          </div>
        </div>
      </div>`
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
