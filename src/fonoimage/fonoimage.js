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
import Oreille from '../images/oreille.svg';
import Poubelle from '../images/trash.svg';
import Export from '../images/export.svg';
import Import from '../images/import.svg';
import Maison from '../images/maison.jpg';
import FlecheDroite from '../images/fleche-droite.svg';

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
        fonofone_pardefaut: null, // ne devrait pas servir
        haut_parleur: true,
        cadenas: false,
        gestion_bg: false,
        mode: 'normal',
        mode_solo: null,
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
        importer: async function (fichier) {
          let archive_serialisee = await new Promise((resolve) => {
            let fileReader = new FileReader();
            fileReader.onload = (e) => resolve(fileReader.result);
            fileReader.readAsText(fichier);
          });

          let archive = JSON.parse(archive_serialisee);

          // Faire le menage
          _.each(this.zones, (zone) => { this.supprimer_zone(zone) });
          this.zone_active = null;

          // Ajouter les zones et les fonofones
          _.each(archive.zones, (zone) => {
            let ellipse = zone.ellipse;
            this.ajouter_zone(ellipse.left, ellipse.top, ellipse.rx, ellipse.ry, ellipse.angle, zone.fonofone);
          });

          // Charger l'arriere-plan
          this.set_arriere_plan(archive.arriere_plan);
        },
        exporter: function () {
          saveAs(new Blob([this.serialiser()]), `archive.fnmg`);
        },
        serialiser: function () {
          return JSON.stringify({ 
            arriere_plan: this.arriere_plan,
            zones: _.map(this.zones, (zone) => { 
              return { 
                ellipse: this.get_coords_ellipse(zone.ellipse),
                fonofone: this.get_fonofone(zone).serialiser() 
              } 
            })
          });
        },

        // UI
        afficher_zone: function (zone) {
          this.zone_active = zone;
          this.$nextTick(() => { if(zone.mounted) this.get_fonofone(zone).paint(); });
        },
        set_arriere_plan: function (url) {
          this.arriere_plan = url;
        },
        set_masque: function (coords) {
          let el = this.$refs.masque; 
          let cx = coords.left + coords.width / 2;
          let cy = coords.top + coords.height / 2;
          let svg_masque = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.canva.width} ${this.canva.height}" preserveAspectRatio="none"><ellipse cx="${cx}" cy="${cy}" rx="${coords.rx}" ry="${coords.ry}" transform="rotate(${coords.angle} ${cx} ${cy})" fill="black" /></svg>'), linear-gradient(#fff,#fff)`;

          el.style['-webkit-mask-image'] = svg_masque; // Chrome / Safari
          el.style['mask-image'] = svg_masque; // FF
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
          this.supprimer_zone(this.zone_active);
          this.zone_active = null;
        },
        supprimer_zone: function (zone) {
          if(zone == this.mode_solo) this.mode_solo = null;
          this.desactiver_son(zone);
          this.get_fonofone(zone).$destroy();
          this.canva.remove(zone.ellipse);
          delete this.zones[zone.id];
        },

        // Controlleurs
        toggle_solo: function (zone, val) {

          // Enlever le masque
          if(this.mode_solo == zone) {
            _.each(this.zones, (zone) => { this.activer_son(zone); });
            this.mode_solo = null;
          }

          // Appliquer le masque
          else {
            _.each(this.zones, (z) => { 
              if(z == zone) return;
              this.get_fonofone(z).set_solo(false);
              this.desactiver_son(z); 
            });
            this.activer_son(zone);
            this.mode_solo = zone;
            this.set_masque(this.get_coords_ellipse(zone.ellipse));
          }
        },
        activer_son: function (zone) {
          zone.master_solo.gain.setValueAtTime(1, this.ctx_audio.currentTime);
        },
        desactiver_son: function (zone) {
          zone.master_solo.gain.setValueAtTime(0, this.ctx_audio.currentTime);
        },
        toggle_ff_pleine_largeur: function () {
          this.ff_pleine_largeur = !this.ff_pleine_largeur;

          // Resfresh mitaine pour avoir l'air moins fou
          let fps_refresh = 15;
          let refresh = setInterval(() => { this.get_fonofone(this.zone_active).paint(); }, 1000 / fps_refresh);
          setTimeout(() => { clearInterval(refresh); }, 1000);
        },
        toggle_ff_minimiser: function (zone, val) {
          zone.minimiser = val;
          let fonoimage = this.$refs.fonoimage;
          let el_ff = fonoimage.querySelector(`#${zone.id}`);

          // Mode minimiser
          if(zone.minimiser) {
            el_ff.classList.add("flottant");
            let coords_ellipse = zone.ellipse.getBoundingRect();

            // Axe des X
            if(coords_ellipse.left > zone.canvas.getElement().offsetWidth / 2) {
              el_ff.style.left = (coords_ellipse.left - 300) + "px"
            }
            else {
              el_ff.style.left = (coords_ellipse.left + coords_ellipse.width) + "px"
            }

            // Axe des Y
            if(coords_ellipse.top > zone.canvas.getElement().offsetHeight / 2) {
              el_ff.style.top = Math.max(coords_ellipse.top - 500, 0) + "px"
            }
            else {
              el_ff.style.top = (coords_ellipse.top + coords_ellipse.height) + "px"
            }

            // Deplacer l'element
            fonoimage.appendChild(el_ff);
          }

          // Mode maximiser
          else {
            el_ff.style.left = 0;
            el_ff.style.top = 0;
            el_ff.classList.remove("flottant");
            this.$refs.panneau_fonofone.appendChild(el_ff);
          }

          this.$forceUpdate(); // Sinon le panneau ne se rafraichi pas
          this.$nextTick(() => { this.get_fonofone(this.zone_active).paint(); });
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
          _.each(this.zones, (zone) => {
            this.cadenas ? zone.immobiliser() : zone.rendre_mobile();
          });
        },
        toggle_hp: function () {
          this.haut_parleur = !this.haut_parleur;
          this.master.gain.setValueAtTime(this.haut_parleur ? 1 : 0, this.ctx_audio.currentTime);
        },
        moduler_son_zones: function (options) {
          _.each(this.zones, (zone) => { this.moduler_son_zone(zone); });
        },
        moduler_son_zone: function (zone) {
          if(zone.mode == 'mix') {
            let coords_oreille = { x: this.oreille.left + this.oreille.width / 2, y: this.oreille.top + this.oreille.height / 2};
            let coords_zone = { x: zone.left + zone.width / 2, y: zone.top + zone.height / 2};
            let proximite = proximite_centre_ellipse(coords_oreille, zone.ellipse);
            zone.master.gain.setValueAtTime(proximite, this.ctx_audio.currentTime);
          }
        },

        // Gestion des zones
        dessiner_nouvelle_zone: function (options) {

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
            this.canva.setCursor("default");

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
          });

          // Afficher le shadow
          this.canva.on('mouse:move', (options) => {
            //this.canva.renderAll();
            shadow_style.width = (options.e.clientX - init_event.clientX) + "px";
            shadow_style.height = (options.e.clientY - init_event.clientY) + "px";
          });
        },
        ajouter_zone: function (x, y, rx, ry, angle = 0, fonofone = null) {

          let mode = 'mix';
          if(fonofone) {
            mode = JSON.parse(fonofone).fonoimage.mode;
          }

          // Creation
          let zone = new Zone({
            x, y, rx, ry, angle, mode,
            ctx_audio: this.ctx_audio,
            canvas: this.canva,
            master_fonoimage: this.master,
            on_selected: (zone) => { this.afficher_zone(zone) },
            on_moving: (zone) => { 
              this.set_masque(this.get_coords_ellipse(zone.ellipse));
              this.moduler_son_zone(zone);
            }
          }, fonofone);
          
          // Mise en service
          this.zones[zone.id] = zone;
          this.canva.setActiveObject(this.oreille); // Pour activer le son
          this.canva.setActiveObject(zone.ellipse);
        },
        faire_jouer: function (zone) {
          let ff = this.get_fonofone(zone);
          ff.force_play();
          ff.paint();
        },

        // Outils
        get_fonofone: function (zone) {
          return this.$refs[zone.id][0];
        },
        get_coords_ellipse: function (ellipse) {
          let coords = ellipse.getBoundingRect();
          coords.angle = ellipse.angle;
          coords.rx = ellipse.rx;
          coords.ry = ellipse.ry;
          return coords; 
        }
      },
      created: function () {

        // Diagramme audio
        this.master = this.ctx_audio.createGain();
        this.media_stream_destination = this.ctx_audio.createMediaStreamDestination(); 

        this.master.connect(this.ctx_audio.destination);
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
          hoverCursor: 'pointer',
          width: application.offsetWidth,
          height: application.offsetHeight
        }).on('mouse:down', (options) => {
          this.canva.setCursor("cell");

          // Si on ne clique pas sur une zone
          if(!options.target && !this.cadenas) { 
            this.zone_active = null; 
            this.gestion_bg = false;
            this.dessiner_nouvelle_zone(options);
          }
        });

        this.set_arriere_plan(Maison);

        // Afficher le micro
        new Fabric.Image.fromURL(Oreille, (oreille) => {
          this.oreille = oreille;
          //oreille.originX = "center";
          //oreille.originY = "center";
          oreille.set('left', this.canva.width / 2);
          oreille.set('top', this.canva.height / 2);
          oreille.setCoords();
          oreille.on('moving', (options) => { this.moduler_son_zones(options); });
          oreille.on('selected', (options) => { this.moduler_son_zones(options); });

          // Empecher le resize
          oreille.hasControls = false;
          this.canva.add(oreille);
        });
      },
      template: `
      <div class="fonoimage" ref="fonoimage">
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
          <section class="principal" :style="{ backgroundImage: 'url(' + arriere_plan + ')' }">
            <div class="app-fonoimage" ref="application_fonoimage">
              <canvas id="canva-fonoimage" ref="canva_fonoimage"></canvas>
            </div>
            <div class="pellicule" :class="{actif: mode_solo}" ref="masque"></div>
            <div class="gestion-arriere-plan" :class="{actif: gestion_bg}" ref="gestion_arriere_plan">
              <h3 class="entete">
                <img src="${Images}" @click="toggle_gestion_bg"/>
                <span>{{ $t('arriereplan') }}</span>
              </h3>
              <div class="container-arrieres-plans">
                <div v-for="arpl in arrieres_plans" class="img" :style="{'background-image': 'url(' + arpl + ')'}" @click="set_arriere_plan(arpl)"/>
              </div>
            </div>
            <div class="panneau-importation" :class="{actif: mode_importation}">
              <div class="fenetre" ref="filepond_archive"></div>
            </div>
          </section>
          <div class="shadow" :class="{actif: mode == 'edition:ajout:encours'}" ref="shadow"></div>
        </div>
        <div class="panneau-fonofone" v-show="zone_active && !zone_active.minimiser" :class="{actif: zone_active, pleinePage: ff_pleine_largeur}" ref="panneau_fonofone">
          <div class="rond-central" @click="toggle_ff_pleine_largeur"><img src="${FlecheDroite}"/></div>
          <fonofone v-for="(zone, key) in zones" v-show="zone == zone_active" :id="key" :ref="key" :key="key" :ctx_audio="ctx_audio" :noeud_sortie="zone.master" :integration_fonoimage="true" :archive="zone.configuration_fonofone || fonofone_pardefaut" @update:mode="zone.toggle_mode($event)" @update:minimiser="toggle_ff_minimiser(zone, $event)" @update:solo="toggle_solo(zone, $event)" @mounted="zone.mounted = true"></fonofone>
        </div>
      </div>`
    });
  }
}

function theta (x, y) {
  return Math.atan2(y, x);
}

function cartesian2Polar(x, y){
  return { distance: Math.sqrt(x*x + y*y), radians: Math.atan2(y,x) };
}

function rad2deg (rad) {
  return rad * 180 / Math.PI;
}

function deg2rad (deg) {
  return deg * Math.PI / 180;
}

function distance_euclidienne (point) {
  return Math.sqrt(Math.pow(point.x, 2) + Math.pow(point.y, 2));
}

function proximite_centre_ellipse (coords_oreille, ellipse) {

  // Initialisation
  let centre = { x: ellipse.left + ellipse.width / 2, y: ellipse.top + ellipse.height / 2 };

  // Enlever la rotation
  let pointer_sans_rotation = annuler_rotation(ellipse.angle, centre, coords_oreille);

  // Calculer l'angle entre le centre et le curseur
  let pointeur_sans_rotation_normalise = { x: pointer_sans_rotation.x - centre.x, y: pointer_sans_rotation.y - centre.y };
  let theta_pointeur_sans_rotation = theta(pointeur_sans_rotation_normalise.x, pointeur_sans_rotation_normalise.y);

  // Calculer les x et y max pour l'angle donne
  let coord_max = { x: ellipse.rx * Math.cos(theta_pointeur_sans_rotation), y: ellipse.ry * Math.sin(theta_pointeur_sans_rotation) };
  let distance_max = distance_euclidienne(coord_max);

  // Calculer la distance entre le centre et les x/y max
  let distance_pointeur = distance_euclidienne(pointeur_sans_rotation_normalise);

  return 1 - Math.min(distance_pointeur / distance_max, 1);
}

function annuler_rotation (angle, centre, obj) {

  // Cartesien en polaire
  let polaire = cartesian2Polar(obj.x - centre.x, obj.y - centre.y);

  // Annuler rotation
  polaire.radians -= angle * Math.PI / 180;

  // polaire en cartesien
  return { x: polaire.distance * Math.cos(polaire.radians) + centre.x, y: polaire.distance * Math.sin(polaire.radians) + centre.y };
}
