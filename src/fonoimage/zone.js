const Fabric = require("fabric").fabric;

export default class Zone {
  constructor (x, y, w, h, ctx_audio, stream_destination) {

    this.id = Date.now() + " " + Math.round(Math.random() * 50);
    this.mode = 'pic';

    // Fonofone
    this.container_fonofone = document.createElement("div");
    this.noeud_sortie = ctx_audio.createGain();
    this.noeud_sortie.connect(stream_destination);

    // Visuel // TODO
    let grad = new Fabric.Gradient({
      type: 'radial',
      colorStops: [{
        color: 'black',
        offset: 0
      },
        {    
          color: 'white',
          offset: 1
        }
      ]
    });

    this.ellipse = new Fabric.Ellipse({
      top: y, left: x, rx: w, ry: h,
      stroke: 'blue',
      strokeWidth: 5,
      fill: grad
    }).on('selected', (e) => { 
      this.afficher_fonofone(nouvelle_zone); 
    }).on('mousemove', (e) => { 
      console.log('out', e);
    });
  }

  get_fonofone_container () {
    return this.container_fonofone;
  }

  get_ellipse () {
    return this.ellipse;
  }
}
