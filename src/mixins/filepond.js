import * as FilePond from 'filepond';
import 'filepond/dist/filepond.min.css';

export default {
  methods: {
    init_filepond: function () {

      // Upload fichiers
      let filepond = this.outils.filepond = FilePond.create({ 
        name: 'filepond',
        credits: false
      });

//      filepond.labelIdle = this.$t("filepond.idle");


      this.$refs.filepond.appendChild(this.outils.filepond.element);

      let filepond_el = this.$refs.filepond.firstChild;
      filepond_el.addEventListener('FilePond:addfile', e => { 
        let fichier = e.detail.file;

        console.log(fichier);
        if(fichier.fileType.match(/audio/)) {
          this.update_fichier_audio(fichier.file);
          this.mode_importation = false;
        } else if (fichier.fileExtension == "fnfn") { // TODO, semble manquer un repaint
          this.importer(fichier.file);
          this.mode_importation = false;
        } else {
          throw "type de fichier non valide";
        }
      });
    }
  },
  mounted: function () {
    this.init_filepond();
  }
}
