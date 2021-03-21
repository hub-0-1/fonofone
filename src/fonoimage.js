import Vue from 'vue';
import _ from 'lodash';
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
        zone_actif: null,
        ctx_audio: new AudioContext,
        media_stream_destination: null,
        enregistrement: {
          encours: false,
          enregistreur: null
        },
        zones: {}
      },
      methods: {
        exporter: function () {
          console.log(JSON.stringify(this.canva));
        },
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

            this.mode = "edition";
          });

          // Afficher le shadow
          this.canva.on('mouse:move', (options) => {
            shadow_style.width = (options.e.clientX - init_event.clientX) + "px";
            shadow_style.height = (options.e.clientY - init_event.clientY) + "px";
          });
        },
        ajouter_zone: function (x, y, rx, ry) {
          //let nzone = new Zone(x, y, w, h, this.ctx_audio, this.media_stream_destination);

          let nouvelle_zone = {
            id: `${Date.now()}${Math.round(Math.random() * 50)}`,
            mode: 'mix'
          };
          this.zones[nouvelle_zone.id] = nouvelle_zone;

          // Fonctionnalites
          nouvelle_zone.container_fonofone = document.createElement("div");

          // Fonofone
          nouvelle_zone.noeud_sortie = this.ctx_audio.createGain();
          nouvelle_zone.noeud_sortie.connect(this.media_stream_destination);

          nouvelle_zone.ellipse = new Fabric.Ellipse({
            top: y, left: x, rx: rx, ry: ry,
            stroke: 'blue',
            strokeWidth: 5,
            fill: 'transparent'
          }).on('selected', () => { 
            this.afficher_fonofone(nouvelle_zone); 
          }).on('mousedown', (options) => {

            if(this.mode.match(/normal|session/) && nouvelle_zone.mode == 'pic') {
              if(nouvelle_zone.pointeur) {
                this.canva.remove(nouvelle_zone.pointeur);
              }
              let pointer_pos = this.canva.getPointer(options.e);
              let pointer = new Fabric.Image.fromURL(Micro, (img) => { 
                nouvelle_zone.pointeur = img;
                img.set('left', pointer_pos.x - 10);
                img.set('top', pointer_pos.y - 10);
                img.set('width', 20);
                img.set('height', 20);
                this.canva.add(img);
              });
              
            }
          }).on('mousemove', (options) => {

            // Conditions de calcul
            if(this.mode.match(/normal|session/) && nouvelle_zone.mode == 'mix') {
              
              // Initialisation
              let pointer_pos = this.canva.getPointer(options.e);
              let aCoords = options.target.aCoords;

              // Normaliser
              let pointer_dans_ellipse = {
                x: pointer_pos.x - aCoords.tl.x,
                y: pointer_pos.y - aCoords.tl.y,
              }
              let centre_ellipse = { x: rx, y: ry };

              let distance = this.distance_ellipse(pointer_dans_ellipse, centre_ellipse);
              if(distance > 0) {
                console.log(distance);
                nouvelle_zone.noeud_sortie.gain.setValueAtTime(distance, this.ctx_audio.currentTime);
              }
            }
          });

          this.canva.add(nouvelle_zone.ellipse);
          this.afficher_fonofone(nouvelle_zone);
        },
        // TODO Tres mauvais calcul de la distance
        distance_ellipse: function (coords, centre) {
          //let coords_centrees = { x: coords.x - centre.x, y: coords.y - centre.y };
          //let angle = theta(coords_centrees.x, coords_centrees.y);

          let distances = { x: Math.abs(coords.x - centre.x) / centre.x, y: Math.abs(coords.y - centre.y) / centre.y };
          let distance = distances.x + distances.y;
          return 1 - Math.min(distance, 1);
        },
        afficher_fonofone: function (zone_active) {
          this.zone_actif = zone_active;

          // Cacher et afficher les zones
          _.each(this.zones, (zone) => { zone.container_fonofone.style.display = "none"; });
          this.zone_actif.container_fonofone.style.display = "initial";
        },
        // TODO Session vs Enregistrement?
        toggle_session: function () {
          this.mode.match(/session/) ? this.fin_session() : this.debut_session();
        },
        toggle_mode_edition: function () {
          if(this.mode.match(/edition/)) {
            this.set_mode_normal();
          } else {
            this.set_mode_edition();
          }
        },
        set_mode_normal: function () {
          this.mode = "normal";
          _.each(this.zones, (zone) => {
            zone.noeud_sortie.gain.setValueAtTime(0, this.ctx_audio.currentTime);
          })
        },
        set_mode_edition: function () {
          this.mode = "edition";
          _.each(this.zones, (zone) => {
            console.log(zone);
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
            this.zone_actif = null; 

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
            <img src="${Record}" class="record" :class="{actif: mode.match(/normal|session/), flash: mode == 'session:active'}" @click="toggle_session">
            <img src="${Crayon}" class="crayon" :class="{actif: mode.match(/edition/)}" @click="toggle_mode_edition"/>
          </menu>
          <section class="principal">
            <menu class="vertical" :class="{actif: mode.match(/edition/)}">
              <div class="icone-wrapper invert" :class="{actif: mode.match(/ajout/)}" @click="mode = 'edition:ajout:pret'">
                <img src="${Ellipse}">
              </div>
              <div class="icone-wrapper invert">
                <img src="${Image}">
              </div>
            </menu>
            <div class="app-fonoimage" ref="application_fonoimage">
              <canvas id="canva-fonoimage" ref="canva_fonoimage"></canvas>
            </div>
          </section>
          <div class="shadow" :class="{actif: mode == 'ajout:encours'}" ref="shadow"></div>
        </div>
        <div class="panneau-fonofone" :class="{actif: zone_actif}" ref="panneau_fonofone">
          <fonofone v-for="(zone, key) in zones" :id="key" :ref="key" :key="key" :ctx_audio="ctx_audio" :noeud_sortie="zone.noeud_sortie" :integration_fonoimage="true" :archive="archive_primitive_fonofone" @update:mode="toggle_mode_zone(zone, $event)"></fonofone>
        </div>
      </div>`
    });
  }
}

function theta (x, y) {
  return Math.atan2(y, x);
}
