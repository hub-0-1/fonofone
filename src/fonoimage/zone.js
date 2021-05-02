const Fabric = require("fabric").fabric;

const couleur_zone_active = "white";
const couleur_zone_mix = "blue";
const couleur_zone_pic = "orange";

export default class Zone {
  constructor (x, y, rx, ry, angle, ctx_audio, canvas, master_fonoimage, on_selected, configuration_fonofone =  null) {

    this.canvas = canvas;
    this.ctx_audio = ctx_audio;
    this.id = `zone${Date.now()}${Math.round(Math.random() * 50)}`;
    this.mode = 'mix';
    this.configuration_fonofone = configuration_fonofone;
    this.survolee = false;
    this.pointeur = null;

    // Audio fonofone
    this.master = ctx_audio.createGain();
    this.master_solo = ctx_audio.createGain();

    this.master.connect(this.master_solo);
    this.master_solo.connect(master_fonoimage);

    // Visuel
    this.ellipse = new Fabric.Ellipse({
      top: y, left: x, rx: rx, ry: ry, angle: angle, 
      stroke: 'blue',
      strokeWidth: 5,
      fill: 'transparent',
      // Pour la selection par bordure seulement
      perPixelTargetFind:true,
      clickableMargin: 100
    }).on('selected', () => {
      on_selected(this);
    });
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

  toggle_mode (mode) {
    this.mode = mode;
    if(mode == 'pic') {
      this.ellipse.set('stroke', couleur_zone_pic);
      this.master.gain.setValueAtTime(1, this.ctx_audio.currentTime);
    } else {
      this.ellipse.set('stroke', couleur_zone_mix);
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

