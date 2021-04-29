const Fabric = require("fabric").fabric;

export default class Zone {
  constructor (x, y, rx, ry, ctx_audio, canvas, master, on_selected, configuration_fonofone =  null) {

    this.canvas = canvas;
    this.id = `zone${Date.now()}${Math.round(Math.random() * 50)}`;
    this.mode = 'mix';
    this.configuration_fonofone = configuration_fonofone;
    this.survolee = false;
    this.pointeur = null;

    // Audio fonofone
    this.master = ctx_audio.createGain();
    this.master.connect(master);

    // Visuel
    this.ellipse = new Fabric.Ellipse({
      top: y, left: x, rx: rx, ry: ry,
      stroke: 'blue',
      strokeWidth: 5,
      fill: 'transparent',
      // Pour la selection par bordure seulement
      perPixelTargetFind:true,
      clickableMargin: 100
    }).on('selected', () => {
      on_selected(this);
    }).on('mousedown', (options) => {

      // Seulement en mode pic
      if(fonoimage.mode.match(/normal|session/) && nouvelle_zone.mode == 'pic') {

        // Preparation du pointeur
        let pointer_pos = canvas.getPointer(options.e);
        if(this.pointeur) { canvas.remove(this.pointeur); }

        this.pointeur = new Fabric.Image.fromURL(Micro, (img) => { 
          this.pointeur = img;
          img.set('left', pointer_pos.x);
          img.set('top', pointer_pos.y);
          img.set('originX', "center");
          img.set('originY', "center");
          canvas.add(img);
        });

        let proximite = this.proximite_centre_ellipse(options, this.ellipse);
        this.master.gain.setValueAtTime(proximite, this.ctx_audio.currentTime);
      }
    });
  }

  proximite_centre_ellipse (options, ellipse) {

    // Initialisation
    let pointer_pos = this.canvas.getPointer(options.e);
    let aCoords = ellipse.aCoords;
    let centre = { x: (aCoords.tl.x + aCoords.br.x) / 2, y: (aCoords.tl.y + aCoords.br.y) / 2 };

    // Enlever la rotation
    let angle = ellipse.get('angle');
    let pointer_sans_rotation = this.annuler_rotation(angle, centre, pointer_pos);

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

  annuler_rotation (angle, centre, obj) {

    // Cartesien en polaire
    let polaire = cartesian2Polar(obj.x - centre.x, obj.y - centre.y);

    // Annuler rotation
    polaire.radians -= angle * Math.PI / 180;

    // polaire en cartesien
    return { x: polaire.distance * Math.cos(polaire.radians) + centre.x, y: polaire.distance * Math.sin(polaire.radians) + centre.y };
  }
}
