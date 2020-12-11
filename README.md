# fonofone
Pour ajouter un nouveau module :
- Creer le module dans src/modules/ en copiant un module existant
- Ajouter le nom du module dans src/traduction.js et modifier la traduction dans le module
- Importer le module dans le fichier src/fonofone_core.js et dans ses composants
- Creer la fonction set_NOMDUMODULE dans src/mixer/mixer.js
- Ajouter le module dans une configuration chargee
