import Vue from 'vue';
import _ from 'lodash';
const Fabric = require("fabric").fabric;

import ApplicationFonofone from './fonofone_core';
import Enregistreur from './enregistreur.js';
import Globales from './globales.js';

import './style_fonoimage.less';
import Image from './images/image.svg';
import Ellipse from './images/ellipse.svg';
import Record from './images/record.svg';
import Micro from './images/micro.svg';
import Crayon from './images/crayon.svg';

import VueI18n from 'vue-i18n';
import i18n from './traductions.js';
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
              Math.abs(coords[0].x - coords[1].x) / 2, // width
              Math.abs(coords[0].y - coords[1].y) / 2// height
            );

            this.mode = "edition";
          });

          // Afficher le shadow
          this.canva.on('mouse:move', (options) => {
            shadow_style.width = (options.e.clientX - init_event.clientX) + "px";
            shadow_style.height = (options.e.clientY - init_event.clientY) + "px";
          });
        },
        ajouter_zone: function (x, y, w, h) {
          let nouvelle_zone = {id: `zone${Date.now()}${Math.round(Math.random() * 50)}`};
          this.zones[nouvelle_zone.id] = nouvelle_zone;

          // Fonctionnalites
          nouvelle_zone.container_fonofone = document.createElement("div");

          // Fonofone
          nouvelle_zone.noeud_sortie = this.ctx_audio.createGain();
          nouvelle_zone.noeud_sortie.connect(this.media_stream_destination);

          // Visuel // TODO Fait nouvelle_zone.ellipse = ... fait planter avec recursion infinie
          let ellipse = new Fabric.Ellipse({
            top: y, left: x, rx: w, ry: h,
            stroke: 'blue',
            strokeWidth: 5,
            fill: 'transparent'
          }).on('selected', () => { 
            this.afficher_fonofone(nouvelle_zone); 
          });

          this.canva.add(ellipse);
          this.afficher_fonofone(nouvelle_zone);
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
          this.mode = this.mode.match(/edition/) ? "normal" : "edition";
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
          <fonofone v-for="(zone, key) in zones" :id="key" :ref="key" :key="key" :ctx_audio="ctx_audio" :noeud_sortie="zone.noeud_sortie" :integration_fonoimage="true" :archive="archive_primitive_fonofone"></fonofone>
        </div>
      </div>`
    });
  }
}
