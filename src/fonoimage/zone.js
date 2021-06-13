const Fabric = require("fabric").fabric;

const couleur_zone_active = "rgb(255, 255, 255)";
const couleur_zone_mix = "rgb(0, 0, 255)";
const couleur_zone_pic = "rgb(242, 165, 26)";

export default class Zone {
  constructor (parametres, configuration_fonofone =  null) {

    this.parametres = parametres;
    this.canvas = parametres.canvas;
    this.ctx_audio = parametres.ctx_audio;
    this.id = `zone${Date.now()}${Math.round(Math.random() * 50)}`;
    this.configuration_fonofone = configuration_fonofone;
    this.mode = parametres.mode;
    this.survolee = false;
    this.mounted = false;
    this.pointeur = null;

    // Audio fonofone
    this.master = this.ctx_audio.createGain();
    this.master_solo = this.ctx_audio.createGain();

    this.master.connect(this.master_solo);
    this.master_solo.connect(parametres.master_fonoimage);

    // Visuel
    this.paint_ellipse(parametres.x, parametres.y, parametres.rx, parametres.ry, parametres.angle);
  }
  
  paint_ellipse (left, top, rx, ry, angle) {

    // Reset
    if(this.ellipse) {
      this.canvas.remove(this.ellipse);
      this.ellipse = null;
    }

    // Paint
    this.ellipse = new Fabric.Ellipse({
      left, top, rx, ry, angle, 
      strokeWidth: 10,
      fill: 'transparent',

      // Pour la selection par bordure seulement
      perPixelTargetFind: true,
      clickableMargin: 100
    }).on('scaled', (e) => {
      let ellipse = this.ellipse;
      this.paint_ellipse(ellipse.left, ellipse.top, ellipse.rx * ellipse.scaleX, ellipse.ry * ellipse.scaleY, ellipse.angle);
      this.canvas.setActiveObject(this.ellipse);
      this.parametres.on_moving(this);
    }).on('moving', () => {
      this.parametres.on_moving(this);
    }).on('rotating', () => {
      this.parametres.on_moving(this);
    }).on('deselected', () => {
      this.actif = false;
      this.set_couleurs();
    }).on('selected', () => {
      this.parametres.on_selected(this);
      this.actif = true;
      this.set_couleurs();
    });

    this.canvas.add(this.ellipse);
    this.set_couleurs();
  }

  rendre_mobile () {
    this.ellipse.hasControls = true;
    this.ellipse.hasBorders = true;
    this.ellipse.lockMovementX = false;
    this.ellipse.lockMovementY = false;
  }

  immobiliser () {
    this.ellipse.hasControls = false;
    this.ellipse.hasBorders = false;
    this.ellipse.lockMovementX = true;
    this.ellipse.lockMovementY = true;
  }

  set_couleurs () {
    let couleur_bordure = null;
    if(this.actif) {
      couleur_bordure = couleur_zone_active;
    } else {
      couleur_bordure = this.mode == 'mix' ? couleur_zone_mix : couleur_zone_pic;
    }
    this.ellipse.set('stroke', couleur_bordure);
  }

  toggle_mode (mode) {
    this.mode = mode;
    this.set_couleurs();
    if(mode == 'pic') {
      this.master.gain.setValueAtTime(1, this.ctx_audio.currentTime);
    } else {
      this.master.gain.setValueAtTime(0, this.ctx_audio.currentTime);
      if(this.pointeur) {
        this.canvas.remove(this.pointeur);
        this.pointeur = null;
      }
    }

    // Sinon, pas de rendu
    this.canvas.renderAll();
  }

  initialiser_selection_par_bordure () {
    Fabric.Ellipse.prototype._checkTarget = function(pointer, obj, globalPointer) {
      if (obj &&
        obj.visible &&
        obj.evented &&
        this.containsPoint(null, obj, pointer)) {
        if ((this.perPixelTargetFind || obj.perPixelTargetFind) && !obj.isEditing) {
          var isTransparent = this.isTargetTransparent(obj, globalPointer.x, globalPointer.y);
          if (!isTransparent) { return true; }
        } else {
          var isInsideBorder = this.isInsideBorder(obj);
          if (!isInsideBorder) { return true; }
        }
      }
    }

    Fabric.Ellipse.prototype.isInsideBorder = function(target) {
      var pointerCoords = target.getLocalPointer();
      if (pointerCoords.x > target.clickableMargin &&
        pointerCoords.x < target.getScaledWidth() - clickableMargin &&
        pointerCoords.y > clickableMargin &&
        pointerCoords.y < target.getScaledHeight() - clickableMargin) {
        return true;
      }
    }
  }
}

