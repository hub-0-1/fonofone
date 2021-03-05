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

        if(fichier.fileType.match(/audio/)) {
          new Response(fichier.file).blob().then((blob) =>{
            this.globales.sons.push({ nom: fichier.filenameWithoutExtension, blob: blob });
          });
        } else if (fichier.fileExtension == "fnfn") {
          this.mode_importation = false;
          this.importer(fichier.file);
        } else {
          this.mode_importation = false;
          throw "type de fichier non valide";
        }
      });
    }
  },
  mounted: function () {
    this.init_filepond();
  }
}
