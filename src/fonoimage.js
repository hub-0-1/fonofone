import Vue from 'vue';
import _ from 'lodash';
import { saveAs } from 'file-saver';
const Fabric = require("fabric").fabric;

import ApplicationFonofone from './fonofone_core';
import Enregistreur from './enregistreur.js';
import Zone from './fonoimage/zone.js';
import Globales from './fonoimage/globales.js';

import './fonoimage/style.less';
import Image from './images/image.svg';
import Ellipse from './images/ellipse.svg';
import Record from './images/record.svg';
import Micro from './images/micro.svg';
import Crayon from './images/crayon.svg';
import Poubelle from './images/trash.svg';
import Export from './images/export.svg';

import VueI18n from 'vue-i18n';
import i18n from './fonoimage/traductions.js';
Vue.use(VueI18n);

window.Fonoimage = class Fonoimage {
  constructor (el, archive) {
    let AudioContext = window.AudioContext || window.webkitAudioContext;

    this.app = new Vue({
      el,
      i18n,
      components: {
        "fonofone": ApplicationFonofone
      },
      data: {
        archive,
        archive_primitive_fonofone: null,
        configuration: {parametres: {}},
        mode: 'normal',
        zone_active: null,
        ctx_audio: new AudioContext,
        media_stream_destination: null,
        afficher_gestion_arriere_plan: false,
        enregistrement: {
          encours: false,
          enregistreur: null
        },
        zones: {}
      },
      methods: {
        exporter: function () {
          this.serialiser().then((archive) => {
            saveAs(new Blob([archive]), `archive.fnmg`);
          });
        },
        serialiser: function () {
          return Promise.all(_.map(this.zones, (zone) => {
            return this.$refs[zone.id][0].serialiser();
          })).then((fonofones) => {
            return JSON.stringify({
              canva: this.canva.toObject(),
              fonofones
            });
          });
        },
        afficher_fonofone: function (zone_active) {
          this.zone_active = zone_active;
        },
        // TODO Session vs Enregistrement?
        toggle_session: function () {
          this.mode.match(/session/) ? this.fin_session() : this.debut_session();
        },
        toggle_mode_edition: function () {
          this.mode.match(/edition/) ? this.set_mode_normal() : this.set_mode_edition();
        },
        set_mode_normal: function () {
          this.mode = "normal";
          _.each(this.zones, (zone) => {
            zone.noeud_sortie.gain.setValueAtTime(0, this.ctx_audio.currentTime);
            this.$refs[zone.id][0].force_play();
          })
        },
        set_mode_edition: function () {
          this.mode = "edition";
          _.each(this.zones, (zone) => {
            zone.noeud_sortie.gain.setValueAtTime(0, this.ctx_audio.currentTime);
          })
        },
        toggle_mode_zone: function (zone, ev) {
          zone.mode = ev;
          if(zone.mode == 'pic') {
            zone.ellipse.set('stroke', 'orange');
          } else {
            zone.ellipse.set('stroke', 'blue');
          }

          // Sinon, pas de rendu
          this.canva.renderAll();
        },
        toggle_mode_ajout: function () {
          if(this.mode.match(/edition:ajout/)) {
            this.mode = "edition";
          } else {
            this.mode = 'edition:ajout:pret';
          }
        },

        // Gestion des zones
        dessiner_nouvelle_zone: function (options) {
          this.mode = "edition:ajout:encours";

          // Initialisation des variables de scope
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
            })

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
        ajouter_zone: function (x, y, rx, ry) {

          let nouvelle_zone = {
            id: `zone${Date.now()}${Math.round(Math.random() * 50)}`,
            mode: 'mix'
          };
          this.zones[nouvelle_zone.id] = nouvelle_zone;

          // Fonctionnalites
          nouvelle_zone.container_fonofone = document.createElement("div");

          // Fonofone
          nouvelle_zone.noeud_sortie = this.ctx_audio.createGain();
          nouvelle_zone.noeud_sortie.gain.setValueAtTime(0, this.ctx_audio.currentTime);
          nouvelle_zone.noeud_sortie.connect(this.media_stream_destination);

          // Visuel
          nouvelle_zone.centre_ellipse = { x: rx, y: ry }; // TODO mettre a jour si on deplace / rotate / resize l'ellipse
          nouvelle_zone.ellipse = new Fabric.Ellipse({
            top: y, left: x, rx: rx, ry: ry,
            stroke: 'blue',
            strokeWidth: 5,
            fill: 'transparent'
          }).on('selected', () => { 
            this.afficher_fonofone(nouvelle_zone); 
          }).on('mousedown', (options) => {

            // Seulement en mode pic
            if(this.mode.match(/normal|session/) && nouvelle_zone.mode == 'pic') {

              // Preparation du pointeur
              let pointer_pos = this.canva.getPointer(options.e);
              if(nouvelle_zone.pointeur) {
                this.canva.remove(nouvelle_zone.pointeur);
              }

              nouvelle_zone.pointeur = new Fabric.Image.fromURL(Micro, (img) => { 
                nouvelle_zone.pointeur = img;
                img.set('left', pointer_pos.x - Globales.taille_pointeur_pic / 2);
                img.set('top', pointer_pos.y - Globales.taille_pointeur_pic / 2);
                img.set('width', Globales.taille_pointeur_pic);
                img.set('height', Globales.taille_pointeur_pic);
                this.canva.add(img);
              });

              let proximite = this.proximite_centre_ellipse(options, nouvelle_zone.ellipse);
              nouvelle_zone.noeud_sortie.gain.setValueAtTime(proximite, this.ctx_audio.currentTime);
            }
          }).on('mousemove', (options) => {

            // Seulement en mode mix
            if(this.mode.match(/normal|session/) && nouvelle_zone.mode == 'mix') {
              
              let proximite = this.proximite_centre_ellipse(options, nouvelle_zone.ellipse);
              nouvelle_zone.noeud_sortie.gain.setValueAtTime(proximite, this.ctx_audio.currentTime);
            }
          }).on('mouseout', (options) => {

            // Seulement en mode mix, arreter quand on sort du cadre
            if(this.mode.match(/normal|session/) && nouvelle_zone.mode == 'mix') {
              nouvelle_zone.noeud_sortie.gain.setValueAtTime(0, this.ctx_audio.currentTime);
            }
          });

          this.canva.add(nouvelle_zone.ellipse);
          this.canva.setActiveObject(nouvelle_zone.ellipse);
          this.afficher_fonofone(nouvelle_zone);
        },
        proximite_centre_ellipse: function (options, ellipse) {

          // Initialisation
          let pointer_pos = this.canva.getPointer(options.e);
          let aCoords = options.target.aCoords;
          let centre = { x: (aCoords.tl.x + aCoords.br.x) / 2, y: (aCoords.tl.y + aCoords.br.y) / 2 };

          // Enlever la rotation
          let angle = ellipse.get('angle');
          let pointer_sans_rotation = this.annuler_rotation(angle, centre, pointer_pos);

          // Calculer l'angle entre le centre et le curseur
          let pointeur_sans_rotation_normalise = { x: pointer_sans_rotation.x - centre.x, y: pointer_sans_rotation.y - centre.y };
          let theta_pointeur_sans_rotation = theta(pointeur_sans_rotation_normalise.x, pointeur_sans_rotation_normalise.y);

          // Calculer les x et y max pour l'angle donne
          let coord_max = { x: options.target.rx * Math.cos(theta_pointeur_sans_rotation), y: options.target.ry * Math.sin(theta_pointeur_sans_rotation) };
          let distance_max = distance_euclidienne(coord_max);

          // Calculer la distance entre le centre et les x/y max
          let distance_pointeur = distance_euclidienne(pointeur_sans_rotation_normalise);

          return 1 - Math.min(distance_pointeur / distance_max, 1);
        },
        annuler_rotation: function (angle, centre, obj) {

          // Cartesien en polaire
          let polaire = cartesian2Polar(obj.x - centre.x, obj.y - centre.y);

          // Annuler rotation
          polaire.radians -= angle * Math.PI / 180;

          // polaire en cartesien
          return { x: polaire.distance * Math.cos(polaire.radians) + centre.x, y: polaire.distance * Math.sin(polaire.radians) + centre.y };
        },

        // Sessions
        debut_session: function () {
          this.mode = "session:active";
          this.get_enregistreur().debuter();
          new Fabric.Image.fromURL(Micro, (micro) => {
            console.log(micro);
            this.micro = micro;
            micro.originX = "center";
            micro.set('left', this.canva.width / 2);
            micro.set('top', this.canva.height / 2);
            micro.setCoords();
            micro.on('mousedown', function (options_down) {

              // TODO activer l'ecoute
              micro.on('mouseup', function () {
                // TODO https://stackoverflow.com/questions/39098308/how-to-use-two-coordinates-draw-an-ellipse-with-javascript
                // https://mathopenref.com/coordparamellipse.html
                micro.off('mousemove');
                micro.off('mouseup');
              });
              micro.on('mousemove', function (options_move) {
                // 
                console.log(options_move);
              })
            });

            // Empecher le resize
            micro.hasControls = false;
            this.canva.add(micro);
          });
        },
        fin_session: function () {
          this.mode = "normal";
          this.canva.remove(this.micro);
          this.micro = null;
          this.get_enregistreur().terminer().then((blob) => {
            console.log(blob);
          })
        },
        get_enregistreur: function () {
          if(!this.enregistrement.enregistreur)
            this.enregistrement.enregistreur = new Enregistreur(this.media_stream_destination.stream);
          return this.enregistrement.enregistreur;
        },
        supprimer_zone_active: function () {
          this.canva.remove(this.canva.getActiveObject());
          delete this.zones[this.zone_active.id];
          this.zone_active = null;
        }
      },
      created: function () {
        this.media_stream_destination = this.ctx_audio.createMediaStreamDestination(); 
        fetch(Globales.configuration_primitive).then((response) => {
          return response.blob();
        }).then((archive) => {
          this.archive_primitive_fonofone = archive; 
        });
      },
      mounted: function () {
        let application = this.$refs.application_fonoimage;

        // Creer le canva
        this.canva = new Fabric.Canvas('canva-fonoimage', {
          width: application.offsetWidth,
          height: application.offsetHeight
        }).on('mouse:down', (options) => {

          // Si on ne clique pas sur une zone
          if(!options.target) { 

            // Cacher les fonofones
            this.zone_active = null; 

            // Creation d'une nouvelle zone
            if(this.mode == "edition:ajout:pret") { this.dessiner_nouvelle_zone(options); }
          }
        });

        this.set_mode_edition();
      },
      template: `
      <div class="fonoimage">
        <div class="panneau-fonoimage">
          <menu class="horizontal">
            <img src="${Record}" class="record" :class="{actif: mode.match(/normal|session/), flash: mode == 'session:active'}" @click="toggle_session"/>
            <img src="${Crayon}" class="crayon" :class="{actif: mode.match(/edition/)}" @click="toggle_mode_edition"/>
            <img src="${Export}" class="export invert" @click="exporter"/>
          </menu>
          <section class="principal">
            <menu class="vertical" :class="{actif: mode.match(/edition/)}">
              <div class="icone-wrapper invert" :class="{actif: mode.match(/ajout/)}" @click="toggle_mode_ajout">
                <img src="${Ellipse}"/>
              </div>
              <div class="icone-wrapper invert" :class="{actif: afficher_gestion_arriere_plan}" @click="afficher_gestion_arriere_plan = !afficher_gestion_arriere_plan">
                <img src="${Image}"/>
              </div>
              <div class="supprimer-zone icone-wrapper invert" :class="{actif: zone_active}" @click="supprimer_zone_active">
                <img src="${Poubelle}"/>
              </div>
            </menu>
            <div class="app-fonoimage" ref="application_fonoimage">
              <canvas id="canva-fonoimage" ref="canva_fonoimage"></canvas>
            </div>
            <div class="gestion-arriere-plan" :class="{actif: afficher_gestion_arriere_plan}" ref="gestion_arriere_plan">
            </div>
          </section>
          <div class="shadow" :class="{actif: mode == 'ajout:encours'}" ref="shadow"></div>
        </div>
        <div class="panneau-fonofone" :class="{actif: zone_active}" ref="panneau_fonofone">
          <fonofone v-for="(zone, key) in zones" :id="key" :ref="key" :key="key" :ctx_audio="ctx_audio" :noeud_sortie="zone.noeud_sortie" :integration_fonoimage="true" :archive="archive_primitive_fonofone" @update:mode="toggle_mode_zone(zone, $event)" :class="{actif: zone == zone_active}"></fonofone>
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
