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

import Filepond from '../lib/filepond.js';
import Enregistreur from '../lib/enregistreur.js';

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
import './style.less';
import Record from '../images/record.svg';
import Reload from '../images/reload.png';
import Folder from '../images/icon-folder.svg';
import FlecheDroite from '../images/fleche-droite.svg';
import Jouer from '../images/jouer.svg';
import JouerActif from '../images/jouer-actif.svg';
import Loop from '../images/btn-loop.svg';
import LoopActif from '../images/btn-loop-actif.svg';
import Sens from '../images/fleche-sens.svg';
import Crop from '../images/crop.svg';
import Solo from '../images/solo.svg';
import SoloActif from '../images/solo-actif.svg';
import Export from '../images/export.svg';
import Import from '../images/folder-open.svg';
import Micro from '../images/micro.svg';
import ModeMix from '../images/mode-mix.svg';
import ModePic from '../images/mode-pic.svg';
import Maximiser from '../images/maximiser.svg';
import Minimiser from '../images/minimiser.svg';
import DossierBref from '../images/icones_dossiers/icon-son-brefs.svg';
import DossierBruiteux from '../images/icones_dossiers/icon-son-bruiteux.svg';
import DossierDivers from '../images/icones_dossiers/icon-son-divers.svg';
import DossierGlisses from '../images/icones_dossiers/icon-son-glisses.svg';
import DossierHumains from '../images/icones_dossiers/icon-son-humains.svg';
import DossierMelodiques from '../images/icones_dossiers/icon-son-melodiques.svg';
import DossierNatures from '../images/icones_dossiers/icon-son-natures.svg';
import DossierResonnants from '../images/icones_dossiers/icon-son-resonnants.svg';
import DossierSoutenus from '../images/icones_dossiers/icon-son-soutenus.svg';
import DossierLocal from '../images/icones_dossiers/home.svg';

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
      ecran: "normal",
      globales: Globales,
      fonoimage: {
        integration: (this.integration_fonoimage || false),
        mode: 'mix',
        minimiser: false,
        solo: false
      },
      mode_affichage: "colonne", // "grille" ou "colonne"
      mode_importation: false,
      dossier_importation: null,
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

      // Init
      let sources_locales_selectionnees = _.map(this.$refs.sources_export.querySelectorAll("input:checked"), s => s.name);
      let exp = {
        parametres: this.configuration.parametres,
        modules: this.configuration.modules,
        sources: _.cloneDeep(this.configuration.sources)
      };

      // Menage dans les sources
      exp.sources = _.filter(exp.sources, (s) => { return (!s.local || sources_locales_selectionnees.includes(s.id)) })

      // Sauvegarde
      saveAs(new Blob([JSON.stringify(exp)]), `${this.configuration.parametres.nom}.fnfn`);

      this.toggle_ecran("normal");
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
        this.charger_source(this.source_active()).then(() => {
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
    charger_source: function (source) {
      return new Promise ((resolve, reject) => {

        // Desactiver toutes les sources
        _.each(this.configuration.sources, (source) => { source.actif = false; });
        source.actif = true;

        // Aller chercher son (url ou base64)
        fetch(source.url, { mode: 'cors' }).then((response) => {
          return response.blob();
        }).then((blob) => {
          return this.mixer.charger_blob(blob);
        }).then(() => {
          this.toggle_ecran("normal");
          this.$refs.selecteur[0].set_plage(0, 1);
          this.paint();
          resolve(source);
        }).catch((e) => {
          reject(e);
        });
      });
    },
    charger_dossier: function (dossier) {
      this.dossier_importation = this.dossier_importation == dossier ? null : dossier;
    },
    ajouter_son: async function (blob, id) {
      this.configuration.sources.push({
        id: (id || Date.now()),
        actif: false,
        local: true,
        dossier: "local",
        url: await blob2base64(blob)
      });
    },

    // CONTROLLEURS
    force_play: function () {
      this.set_loop(true);
      this.mixer.lancer();
    },
    set_solo: function (val) {
      this.fonoimage.solo = val;
    },
    toggle_loop: function () {
      this.set_loop(!this.mixer.etat.loop);
    },
    set_loop: function (val) {
      this.mixer.set_loop(val);
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
      _.each(this.$refs.wavesurfer.querySelectorAll(".pulsation"), (pulsation) => { pulsation.remove(); })
      this.mixer.toggle_pause();
    },
    toggle_enregistrement: function () {
      this.get_enregistreur().then((enregistreur) => {
        if(!this.enregistrement.encours) {
          enregistreur.debuter();
        } else {
          enregistreur.terminer().then((blob) => { this.ajouter_son(blob) });
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
    toggle_affichage_fonoimage: function () {
      this.fonoimage.minimiser = !this.fonoimage.minimiser;
      this.$emit('update:minimiser', this.fonoimage.minimiser);
    },
    toggle_mode_solo: function () {
      this.fonoimage.solo = !this.fonoimage.solo;
      this.$emit('update:solo', this.fonoimage.solo);
    },
    toggle_ecran: function (ecran) {
      this.ecran = ecran == this.ecran ? "normal" : ecran;
    },
    reset: function () {
      fetch(Globales.configuration_primitive).then((response) => {
        return response.blob();
      }).then((archive) => {
        return this.importer(archive);
      }).then(() => {
        _.each(this.configuration.modules, (v, key) => {
          let module = this.$refs[key][0];
          if(module.charger_props) module.charger_props();
        });
        this.toggle_ecran('normal');
        this.paint();
      });
    },

    // UI
    pulsation: function () {
      let region = this.$refs.wavesurfer.querySelector(".wavesurfer-region");
      if(this.mixer.etat.chargement || !region) return;
      let pulsation = this.creer_barre_pulsation(region);

      setTimeout(() => { this.lancer_barre_pulsation(pulsation, region); }, 0);

      setTimeout(() => { pulsation.remove(); }, this.mixer.parametres.longueur * 1000);
    },
    creer_barre_pulsation: function (region) {
      let temps_pulsation = this.mixer.parametres.longueur;
      let pulsation = document.createElement('div');

      pulsation.className = "pulsation";
      pulsation.style.left = region.style.left;
      pulsation.style.transition = temps_pulsation + "s left linear";

      this.$refs.wavesurfer.appendChild(pulsation);
      return pulsation;
    },
    lancer_barre_pulsation: function (pulsation, region) {
      let droite = region.offsetLeft + region.offsetWidth;
      pulsation.style.left = droite + "px";
    },
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
    icones_dossiers: function (dossier) {
      switch (dossier) {
        case 'brefs': return DossierBref;
        case 'bruiteux': return DossierBruiteux;
        case 'divers': return DossierDivers;
        case 'glisses': return DossierGlisses;
        case 'humains': return DossierHumains;
        case 'melodiques': return DossierMelodiques;
        case 'natures': return DossierNatures;
        case 'resonnants': return DossierResonnants;
        case 'soutenus': return DossierSoutenus;
        default: return DossierLocal;
      }

    },

    // OUTILS
    crop: function () {
      this.mixer.crop();
      this.wavesurfer.loadDecodedBuffer(this.mixer.audio_buffer);

      this.$refs.selecteur[0].set_plage(0, 1);
      this.paint();

      this.ajouter_son(new Blob([toWav(this.mixer.audio_buffer)]), this.source_active().id + "_crop");
    },
    source_active: function () {
      return _.find(this.configuration.sources, "actif");
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
    liste_sources: function () { return _.filter(this.configuration.sources, {dossier: this.dossier_importation}); },
    liste_sources_locales: function () { return _.filter(this.configuration.sources, "local"); }
  },
  created: function () {
    this.mixer = new Mixer(this);
  },
  mounted: function () {

    // Initialisation de l'importation
    this.init_filepond(this.$refs.filepond_son, (fichier) => { 

      // Importation de nouveau fichier audio
      if(fichier.fileType.match(/audio|webm/)) {
        new Response(fichier.file).blob().then((blob) => { this.ajouter_son(blob, fichier.filenameWithoutExtension); }); 
      }
      else {
        this.toggle_ecran("normal");
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

    this.importer(this.archive).then(() => {
      this.appliquer_configuration(this.configuration);
      this.mixer.etat.chargement = false;
      this.$emit("mounted", true); // Pour le fonoimage
    });
  },
  template: `
      <div :id="id" class="fonofone" ref="fonofone">
        <menu>
          <img src="${Reload}" class="invert" @click="toggle_ecran('reinitialisation')">
          <img src="${Import}" @click="toggle_ecran('importation')">
          <img src="${Export}" @click="toggle_ecran('exportation')">
          <img v-if="fonoimage.integration" class="invert" :src="fonoimage.minimiser ? '${Minimiser}' : '${Maximiser}'" @click="toggle_affichage_fonoimage"/>
        </menu>
        <section v-show="ecran == 'normal'" class="ecran app-fonofone">
          <header>
            <div class="nom-archive">
              <img src="${Folder}" @click="toggle_ecran('selection_son')"/>
              <input v-model="configuration.parametres.nom" class="titre texte-nom-archive" placeholder="Archive"/>
            </div>
            <div :id="waveform_id" class="wavesurfer" ref="wavesurfer"></div>
            <div class="menu-controlleurs">
              <div class="gauche">
                <img :src="mixer.etat.jouer ? '${JouerActif}' : '${Jouer}'" class="icone pause" :class="{actif: mixer.etat.jouer}" @click="toggle_pause"/>
                <img v-if="fonoimage.integration" :src="fonoimage.solo ? '${SoloActif}' : '${Solo}'" class="icone solo" @click="toggle_mode_solo"/>
                <img :src="mixer.etat.loop ? '${LoopActif}' : '${Loop}'" class="icone loop" @click="toggle_loop"/>
                <img src="${Sens}" class="icone sens" :class="{actif: configuration.parametres.sens > 0}" @click="toggle_sens"/>
                <img src="${Record}" class="icone session" :class="{actif: mixer.etat.en_session}" @click="toggle_session"/>
                <span v-show="mixer.etat.en_session && !mixer.etat.en_enregistrement">{{ $t('session.activer') }}</span>
                <img src="${Crop}" class="icone" @click="crop"/>
              </div>
              <div v-if="fonoimage.integration" class="droite">
                <img :src="fonoimage.mode == 'mix' ? '${ModeMix}' : '${ModePic}'" @click="toggle_mode_fonoimage"/>
              </div>
            </div>
          </header>
          <main>
            <div class="mixer" :class="mode_affichage" ref="mixer">
              <component v-for="(module, key) in configuration.modules" :is="key" :key="key" :valeur="module.valeur" :disposition="module.disposition" :modifiable="mode_affichage == 'grille'" @update:valeur="module.valeur = $event" @update:disposition="module.disposition = $event" :class="key" :ref="key"></component>
            </div>
          </main>
        </section>
        <section v-show="ecran == 'reinitialisation'" class="ecran">
          <div class="fenetre reinitialisation">
            <button @click="toggle_ecran('reinitialisation')">Annuler</button>
            <button @click="reset">Rétablir les réglages d'origine</button>
          </div>
        </section>
        <section v-show="ecran == 'importation'" class="ecran">
          <div class="fenetre">
            <h3 class="titre">Importer une archive Fonofone</h3>
            <div class="wrapper-filepond" ref="filepond_archive"></div>
          </div>
        </section>
        <section v-show="ecran == 'exportation'" class="ecran">
          <div class="fenetre exportation">
            <h3 class="titre">Fichers à inclure dans la sauvegarde</h3>
            <ul class="sons" ref="sources_export">
              <li v-for="source in liste_sources_locales">
                <input :name="source.id" type="checkbox" checked/>
                <input @click.stop :value="source.id" type="text"/>
              </li>
            </ul>
            <menu>
              <button @click="toggle_ecran('exportation')">Annuler</button>
              <button @click="exporter">Exporter</button>
            </menu>
          </div>
        </section>
        <section v-show="ecran == 'selection_son'" class="ecran">
          <div class="fenetre importation">
            <h3 class="titre">
              <img src="${Folder}" @click="toggle_ecran('selection_son')"/>
              Liste des sons
            </h3>
            <main>
              <ul class="dossiers">
                <li class="dossier" v-for="dossier in liste_dossiers_sons" @click="charger_dossier(dossier)">
                  <div class="entete">
                    <span><img :src="icones_dossiers(dossier)" :alt="dossier"/>{{ $t('dossiers.' + dossier) }}</span>
                    <img src="${FlecheDroite}" alt="fleche de selection" :class="{actif: dossier_importation == dossier}"/>
                  </div>
                  <ul class="sons">
                    <li class="source" v-show="dossier == dossier_importation" v-for="source in liste_sources" @click="charger_source(source)">
                      <input @click.stop :value="source.id" type="text" :disabled="!source.local"/>
                    </li>
                  </ul>
                </li>
              </ul>
              <h3 class="titre">Importer un son</h3>
              <div class="wrapper-filepond" ref="filepond_son"></div>
            </main>
            <h3 class="titre" @click="toggle_enregistrement" :class="{actif: enregistrement.encours}"><img src="${Micro}">Enregistrer un son</h3>
          </div>
        </section>
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
