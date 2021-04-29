import Vue from 'vue';
import _ from 'lodash';
import { saveAs } from 'file-saver';
const Fabric = require("fabric").fabric;

import ApplicationFonofone from '../fonofone/fonofone';
import Filepond from '../lib/filepond.js';
import Enregistreur from '../lib//enregistreur.js';
import Zone from './zone.js';
import Globales from './globales.js';

import './style.less';
import Images from '../images/image.svg';
import Record from '../images/record.svg';
import Micro from '../images/micro.svg';
import Poubelle from '../images/trash.svg';
import Export from '../images/export.svg';
import Import from '../images/import.svg';
import Maison from '../images/maison.jpg';

import Cadenas from '../images/cadenas.svg';
import CadenasOuvert from '../images/cadenas-ouvert.svg';
import HautParleur from '../images/hp.svg';
import HautParleurActif from '../images/hp-actif.svg';

import VueI18n from 'vue-i18n';
import i18n from './traductions.js';
Vue.use(VueI18n);

window.Fonoimage = class Fonoimage {
  constructor (el, archive) {
    let AudioContext = window.AudioContext || window.webkitAudioContext;

    this.app = new Vue({
      el,
      i18n,
      mixins: [Filepond],
      components: {
        "fonofone": ApplicationFonofone
      },
      data: {
        archive,
        fonofone_pardefaut: null,
        configuration: {parametres: {}},
        haut_parleur: true,
        cadenas: false,
        gestion_bg: false,
        mode: 'normal',
        zone_active: null,
        ctx_audio: new AudioContext,
        master: null,
        media_stream_destination: null,
        ff_pleine_largeur: false,
        mode_importation: false,
        arriere_plan: Maison,
        arrieres_plans: Globales.arrieres_plans,
        enregistrement: {
          encours: false,
          enregistreur: null
        },
        filepond: null,
        zones: {}
      },
      methods: {

        // Import / Export
        importer: function (fichier) {
          return new Promise (async (resolve) => {
            let archive_serialisee = await new Promise((resolve) => {
              let fileReader = new FileReader();
              fileReader.onload = (e) => resolve(fileReader.result);
              fileReader.readAsText(fichier);
            });

            let configuration_archive = JSON.parse(archive_serialisee);

            // Faire le menage
            this.zone_active = null;
            this.zones = {};
            this.clearCanva();

            // Ajouter les zones et les fonofones
            _.each(configuration_archive.zones, (zone) => {
              let ellipse = zone.zone.ellipse;
              // TODO
              this.ajouter_zone(ellipse.left, ellipse.top, ellipse.rx, ellipse.ry, zone.fonofone);
            });

            // Charger l'arriere-plan
            this.set_arriere_plan(configuration_archive.arriere_plan);
          });
        },
        exporter: function () {
          this.serialiser().then((archive) => {
            saveAs(new Blob([archive]), `archive.fnmg`);
          });
        },
        serialiser: function () {
          return Promise.all(_.map(this.zones, async (zone) => {
            return {
              zone: zone,
              fonofone: await this.$refs[zone.id][0].serialiser()
            }
          })).then((zones) => {
            return JSON.stringify({ 
              arriere_plan: this.canva.backgroundImage.toDataURL(),
              zones: zones 
            });
          });
        },

        // UI
        clearCanva: function () {
          _.each(this.canva._objects, (obj) => { this.canva.remove(obj); });
        },
        afficher_zone: function (zone_active) {
          this.zone_active = zone_active;
        },
        set_arriere_plan: function (url) {
          if(url.match(/^data/)) {
            let img = new Image();
            img.onload = () => {
              var f_img = new Fabric.Image(img);
              this.canva.setBackgroundImage(f_img);
              this.canva.renderAll();
            };
            img.src = url;
          }
          else {
            this.canva.setBackgroundImage(url, this.canva.renderAll.bind(this.canva), { backgroundImageStretch: true });
          }
        },

        // Sessions
        debut_session: function () {
          this.mode = "session:active";
          this.get_enregistreur().debuter();
        },
        fin_session: function () {
          this.mode = "normal";
          this.get_enregistreur().terminer().then((blob) => {
            saveAs(blob, `session_${Date.now().toString()}.wav`)
          })
        },
        get_enregistreur: function () {
          if(!this.enregistrement.enregistreur)
            this.enregistrement.enregistreur = new Enregistreur(this.ctx_audio, this.media_stream_destination.stream);
          return this.enregistrement.enregistreur;
        },
        supprimer_zone_active: function () {
          this.canva.remove(this.canva.getActiveObject());
          delete this.zones[this.zone_active.id];
          this.zone_active = null;
        },

        // Controlleurs
        toggle_ff_pleine_largeur: function () {
          this.ff_pleine_largeur = !this.ff_pleine_largeur;
        },
        toggle_gestion_bg: function () {
          this.gestion_bg = !this.gestion_bg;
        },
        // TODO Session vs Enregistrement?
        toggle_session: function () {
          this.mode.match(/session/) ? this.fin_session() : this.debut_session();
        },
        toggle_cadenas: function () {
          this.cadenas = !this.cadenas;
        },
        toggle_mode_edition: function () {
          this.mode.match(/edition/) ? this.set_mode_normal() : this.set_mode_edition();
        },
        toggle_hp: function () {
          this.haut_parleur = !this.haut_parleur;
          this.master.gain.setValueAtTime(0, this.haut_parleur ? 1 : 0);
        },
        activer_son: function (zone) {
          zone.master.gain.setValueAtTime(1, this.ctx_audio.currentTime);
        },
        desactiver_son: function (zone) {
          zone.master.gain.setValueAtTime(0, this.ctx_audio.currentTime);
        },
        set_mode_normal: function () {
          this.mode = "normal";
          _.each(this.zones, (zone) => {
            zone.immobiliser();
            this.activer_son(zone);
            this.get_fonofone(zone).force_play();
          });

          // Afficher le micro
          new Fabric.Image.fromURL(Micro, (micro) => {
            this.micro = micro;
            micro.originX = "center";
            micro.set('left', this.canva.width / 2);
            micro.set('top', this.canva.height / 2);
            micro.setCoords();
            micro.on('moving', (options) => { 
              _.each(this.zones, (zone) => {

                // Seulement pour les zones en mode mix
                if(this.mode.match(/normal|session/) && zone.mode == 'mix') {
                  let proximite = this.proximite_centre_ellipse(options, zone.ellipse);
                  zone.master.gain.setValueAtTime(proximite, this.ctx_audio.currentTime);
                }
              });
            });

            // Empecher le resize
            micro.hasControls = false;
            this.canva.add(micro);
          });
        },
        set_mode_edition: function () {
          this.mode = "edition";
          _.each(this.zones, (zone) => {
            zone.rendre_mobile()
            this.desactiver_son(zone);
          });

          // TODO simplement rendre invisble
          if(this.micro) {
            this.canva.remove(this.micro);
            this.micro = null;
          }
        },

        // Gestion des zones
        dessiner_nouvelle_zone: function (options) {
          this.mode = "edition:ajout:encours";

          // Initialisation des variables de scope
          let init_options = options;
          let init_event = options.e;
          let coords = [{
            x: options.absolutePointer.x,
            y: options.absolutePointer.y
          }];
          let shadow_style = this.$refs.shadow.style;

          // Affichage shadow
          shadow_style.left = options.e.clientX + "px";
          shadow_style.top = options.e.clientY + "px";
          shadow_style.width = 0;
          shadow_style.height = 0;

          // Creer a la fin du drag
          this.canva.on('mouse:up', (options) => {
            this.canva.off('mouse:move');
            this.canva.off('mouse:up');

            coords.push({
              x: options.absolutePointer.x,
              y: options.absolutePointer.y
            });

            // Si on a pas bougé
            if(coords[0].x == coords[1].x && coords[0].y == coords[1].y) return;

            this.ajouter_zone(
              Math.min(coords[0].x, coords[1].x), // x
              Math.min(coords[0].y, coords[1].y), // y
              Math.abs(coords[0].x - coords[1].x) / 2, // rayon width
              Math.abs(coords[0].y - coords[1].y) / 2// rayon height
            );

            this.set_mode_edition();
          });

          // Afficher le shadow
          this.canva.on('mouse:move', (options) => {
            shadow_style.width = (options.e.clientX - init_event.clientX) + "px";
            shadow_style.height = (options.e.clientY - init_event.clientY) + "px";
          });
        },
        ajouter_zone: function (x, y, rx, ry, fonofone = null) {
          let zone = new Zone(x, y, rx, ry, this.ctx_audio, this.canvas, this.master, (zone) => {
            this.afficher_zone(zone);
          });
          this.zones[zone.id] = zone;
          this.canva.add(zone.ellipse);
          this.canva.setActiveObject(zone.ellipse);
        },

        // Outils
        get_fonofone: function (zone) {
          return this.$refs[zone.id][0];
        }
      },
      created: function () {

        // Diagramme audio
        this.master = this.ctx_audio.createGain();
        this.media_stream_destination = this.ctx_audio.createMediaStreamDestination(); 
        this.master.connect(this.media_stream_destination);

        fetch(Globales.fonofone_pardefaut).then((response) => {
          return response.blob();
        }).then((archive) => {
          this.fonofone_pardefaut = archive; 
        });
      },
      mounted: function () {

        // Filepond
        this.init_filepond(this.$refs.filepond_archive, (fichier) => { 

          if (fichier.fileExtension == "fnmg") { this.importer(fichier.file); }
          else { throw "type de fichier non valide"; }

          this.mode_importation = false;
        });

        // Créer le canva
        let application = this.$refs.application_fonoimage;
        this.canva = new Fabric.Canvas('canva-fonoimage', {
          width: application.offsetWidth,
          height: application.offsetHeight
        }).on('mouse:down', (options) => {

          // Si on ne clique pas sur une zone
          if(!options.target && !this.cadenas) { 
            this.zone_active = null; 
            this.dessiner_nouvelle_zone(options);
          }
        });

        this.set_arriere_plan(Maison);
      },
      template: `
      <div class="fonoimage">
        <div class="panneau-fonoimage">
          <menu>
            <img src="${Record}" class="record bouton-coin-g-b" :class="{actif: cadenas, flash: mode == 'session:active'}" @click="toggle_session"/>
            <img src="${Images}" class="invert bouton-coin-g-b" :class="{actif: !cadenas}" @click="toggle_gestion_bg"/>
            <div class="gauche">
              <img :src="haut_parleur ? '${HautParleurActif}' : '${HautParleur}'" class="hp" @click="toggle_hp"/>
              <img :src="cadenas ? '${Cadenas}' : '${CadenasOuvert}'" class="cadenas" @click="toggle_cadenas"/>
            <img class="invert poubelle" :class="{actif: zone_active}" @click="supprimer_zone_active" src="${Poubelle}"/>
            </div>
            <div class="droite">
              <img src="${Export}" class="export" @click="exporter"/>
              <img src="${Import}" class="import invert" @click="mode_importation = !mode_importation"/>
            </div>
          </menu>
          <section class="principal">
            <div class="app-fonoimage" ref="application_fonoimage">
              <canvas id="canva-fonoimage" ref="canva_fonoimage"></canvas>
            </div>
            <div class="gestion-arriere-plan" :class="{actif: gestion_bg}" ref="gestion_arriere_plan">
              <h3 class="entete">
                <img src="${Images}" @click="toggle_gestion_bg"/>
                <span>{{ $t('arriereplan') }}</span>
              </h3>
              <div class="container-arrieres-plans">
                <div v-for="arpl in arrieres_plans" class="img" :style="{'background-image': 'url(' + arpl + ')'}" @click="set_arriere_plan(arpl)"/>
              </div>
            </div>
          </section>
          <div class="shadow" :class="{actif: mode == 'edition:ajout:encours'}" ref="shadow"></div>
        </div>
        <div class="panneau-fonofone" :class="{actif: zone_active, pleinePage: ff_pleine_largeur}" ref="panneau_fonofone">
          <div class="rond-central" @click="toggle_ff_pleine_largeur"></div>
          <fonofone v-for="(zone, key) in zones" :id="key" :ref="key" :key="key" :ctx_audio="ctx_audio" :noeud_sortie="zone.master" :integration_fonoimage="true" :archive="zone.configuration_fonofone || fonofone_pardefaut" @update:mode="zone.toggle_mode($event)" :class="{actif: zone == zone_active}"></fonofone>
        </div>
        <div class="panneau-importation" :class="{actif: mode_importation}">
          <div class="background-importation">
            <div class="fenetre-importation">
              <div ref="filepond_archive"></div>
            </div>
          </div>
        </div>
      </div>`
    });
  }
}
