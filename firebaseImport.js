// ============================================
// SCRIPT D'IMPORT FIREBASE ADMIN
// ============================================
// Usage: node firebaseImport.js
// Importe tous les pays et journalistes dans Firestore

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// ============================================
// INITIALISATION FIREBASE
// ============================================

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

const db = admin.firestore();

// ============================================
// DONNÉES À IMPORTER
// ============================================

const countries = [
  {
    id: 'mali',
    name: 'Mali',
    code: 'ML',
    coords: { lat: 17.57, lng: -4.0 },
    description: 'Zone de conflit armé depuis 2012. Les journalistes couvrant le nord du pays sont particulièrement exposés aux groupes armés.',
    riskLevel: 'extreme',
  },
  {
    id: 'senegal',
    name: 'Sénégal',
    code: 'SN',
    coords: { lat: 14.69, lng: -17.44 },
    description: 'Malgré une tradition démocratique, la couverture des tensions politiques expose les journalistes à des pressions croissantes.',
    riskLevel: 'high',
  },
  {
    id: 'burkina',
    name: 'Burkina Faso',
    code: 'BF',
    coords: { lat: 12.37, lng: -1.52 },
    description: "L'instabilité politique et la menace terroriste rendent le travail journalistique extrêmement dangereux.",
    riskLevel: 'extreme',
  },
  {
    id: 'cotedivoire',
    name: "Côte d'Ivoire",
    code: 'CI',
    coords: { lat: 7.54, lng: -5.55 },
    description: 'Les séquelles des crises politiques passées continuent d\'affecter la liberté de la presse.',
    riskLevel: 'critical',
  },
  {
    id: 'niger',
    name: 'Niger',
    code: 'NE',
    coords: { lat: 17.61, lng: 8.08 },
    description: 'La couverture des activités des groupes armés dans la région du Sahel expose les journalistes à des risques majeurs.',
    riskLevel: 'extreme',
  },
  {
    id: 'guinee',
    name: 'Guinée',
    code: 'GN',
    coords: { lat: 9.94, lng: -9.70 },
    description: 'Les transitions politiques tumultueuses créent un environnement hostile pour les journalistes indépendants.',
    riskLevel: 'critical',
  },
  {
    id: 'ghana',
    name: 'Ghana',
    code: 'GH',
    coords: { lat: 7.95, lng: -1.02 },
    description: 'Bien que relativement stable, des cas de violence contre les journalistes d\'investigation persistent.',
    riskLevel: 'high',
  },
  {
    id: 'nigeria',
    name: 'Nigeria',
    code: 'NG',
    coords: { lat: 9.08, lng: 8.68 },
    description: 'Le conflit dans le nord-est et la couverture de la corruption exposent les journalistes à de graves dangers.',
    riskLevel: 'extreme',
  },
];

const journalists = [
  // Mali (4)
  {
    name: 'Amadou Diallo',
    countryId: 'mali',
    countryName: 'Mali',
    role: "Reporter d'investigation",
    yearOfDeath: 2023,
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&crop=face',
    bio: 'Journaliste d\'investigation spécialisé dans la corruption. Mort en tentant de couvrir un conflit armé.',
    placeOfDeath: 'Tombouctou',
    circumstances: 'Tué lors d\'une attaque armée',
    isPublished: true,
  },
  {
    name: 'Boubacar Traoré',
    countryId: 'mali',
    countryName: 'Mali',
    role: 'Correspondant de guerre',
    yearOfDeath: 2022,
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop&crop=face',
    bio: 'Correspondant de guerre couvrant les conflits au Sahel.',
    placeOfDeath: 'Gao',
    circumstances: 'Décédé dans une embuscade',
    isPublished: true,
  },
  {
    name: 'Kadiatou Keita',
    countryId: 'mali',
    countryName: 'Mali',
    role: 'Journaliste radio',
    yearOfDeath: 2021,
    photoUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=500&fit=crop&crop=face',
    bio: 'Animatrice radio, voix de la résistance pacifique.',
    placeOfDeath: 'Bamako',
    circumstances: 'Meurtre politique',
    isPublished: true,
  },
  {
    name: 'Moussa Coulibaly',
    countryId: 'mali',
    countryName: 'Mali',
    role: 'Photo-reporter',
    yearOfDeath: 2023,
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop&crop=face',
    bio: 'Photographe de presse documentant les réalités du conflit.',
    placeOfDeath: 'Nord Mali',
    circumstances: 'Tué en couvrant un combat armé',
    isPublished: true,
  },

  // Sénégal (3)
  {
    name: 'Fatou Ndiaye',
    countryId: 'senegal',
    countryName: 'Sénégal',
    role: 'Journaliste politique',
    yearOfDeath: 2022,
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop&crop=face',
    bio: 'Couvrait les scandales politiques et la corruption.',
    placeOfDeath: 'Dakar',
    circumstances: 'Assassinée pour ses investigations',
    isPublished: true,
  },
  {
    name: 'Ibrahima Sow',
    countryId: 'senegal',
    countryName: 'Sénégal',
    role: 'Éditorialiste',
    yearOfDeath: 2020,
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop&crop=face',
    bio: 'Voix critique dans la presse sénégalaise.',
    placeOfDeath: 'Thiès',
    circumstances: 'Mort en détention',
    isPublished: true,
  },
  {
    name: 'Aminata Fall',
    countryId: 'senegal',
    countryName: 'Sénégal',
    role: 'Reporter terrain',
    yearOfDeath: 2023,
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop&crop=face',
    bio: 'Reporter sur le terrain couvrant les libertés civiles.',
    placeOfDeath: 'Kaolack',
    circumstances: 'Accident suspect',
    isPublished: true,
  },

  // Burkina Faso (4)
  {
    name: 'Aïcha Touré',
    countryId: 'burkina',
    countryName: 'Burkina Faso',
    role: 'Éditorialiste',
    yearOfDeath: 2023,
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=500&fit=crop&crop=face',
    bio: 'Critique féroce du gouvernement militaire.',
    placeOfDeath: 'Ouagadougou',
    circumstances: 'Tuée par des milices',
    isPublished: true,
  },
  {
    name: 'Salifou Ouédraogo',
    countryId: 'burkina',
    countryName: 'Burkina Faso',
    role: 'Journaliste TV',
    yearOfDeath: 2022,
    photoUrl: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=500&fit=crop&crop=face',
    bio: 'Présentateur TV connu pour son intégrité.',
    placeOfDeath: 'Bobo-Dioulasso',
    circumstances: 'Enlèvement et meurtre',
    isPublished: true,
  },
  {
    name: 'Mariam Kaboré',
    countryId: 'burkina',
    countryName: 'Burkina Faso',
    role: 'Correspondante',
    yearOfDeath: 2021,
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=500&fit=crop&crop=face',
    bio: 'Correspondante pour agences internationales.',
    placeOfDeath: 'Nord Burkina',
    circumstances: 'Tuée lors d\'une attaque terroriste',
    isPublished: true,
  },
  {
    name: 'Youssouf Zongo',
    countryId: 'burkina',
    countryName: 'Burkina Faso',
    role: 'Rédacteur en chef',
    yearOfDeath: 2019,
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=500&fit=crop&crop=face',
    bio: 'Fondateur de journal indépendant.',
    placeOfDeath: 'Ouagadougou',
    circumstances: 'Tué pour ses reportages sur la corruption',
    isPublished: true,
  },

  // Côte d'Ivoire (3)
  {
    name: 'Ibrahim Koné',
    countryId: 'cotedivoire',
    countryName: "Côte d'Ivoire",
    role: 'Photo-journaliste',
    yearOfDeath: 2020,
    photoUrl: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&h=500&fit=crop&crop=face',
    bio: 'Photographe documentant les tensions politiques.',
    placeOfDeath: 'Abidjan',
    circumstances: 'Assassiné lors d\'une manifestation',
    isPublished: true,
  },
  {
    name: 'Awa Diabaté',
    countryId: 'cotedivoire',
    countryName: "Côte d'Ivoire",
    role: 'Chroniqueuse',
    yearOfDeath: 2022,
    photoUrl: 'https://images.unsplash.com/photo-1523824921871-d6f1a15151f1?w=400&h=500&fit=crop&crop=face',
    bio: 'Chroniqueuse sociale et critique culturelle.',
    placeOfDeath: 'Yamoussoukro',
    circumstances: 'Mort suspecte en détention',
    isPublished: true,
  },
  {
    name: 'Seydou Bamba',
    countryId: 'cotedivoire',
    countryName: "Côte d'Ivoire",
    role: 'Analyste politique',
    yearOfDeath: 2021,
    photoUrl: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=400&h=500&fit=crop&crop=face',
    bio: 'Analyste politique indépendant.',
    placeOfDeath: 'San-Pédro',
    circumstances: 'Enlèvement et disparition',
    isPublished: true,
  },

  // Niger (3)
  {
    name: 'Ousmane Sow',
    countryId: 'niger',
    countryName: 'Niger',
    role: 'Rédacteur en chef',
    yearOfDeath: 2019,
    photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=500&fit=crop&crop=face',
    bio: 'Rédacteur en chef critique du gouvernement.',
    placeOfDeath: 'Niamey',
    circumstances: 'Tué lors d\'un coup d\'État',
    isPublished: true,
  },
  {
    name: 'Halima Mahamadou',
    countryId: 'niger',
    countryName: 'Niger',
    role: 'Reporter radio',
    yearOfDeath: 2023,
    photoUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=500&fit=crop&crop=face',
    bio: 'Journaliste radio couvrant les droits humains.',
    placeOfDeath: 'Maradi',
    circumstances: 'Assassinée pour ses reportages',
    isPublished: true,
  },
  {
    name: 'Abdoul Razak',
    countryId: 'niger',
    countryName: 'Niger',
    role: 'Correspondant',
    yearOfDeath: 2022,
    photoUrl: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400&h=500&fit=crop&crop=face',
    bio: 'Correspondant pour presse étrangère.',
    placeOfDeath: 'Agadez',
    circumstances: 'Tué lors d\'une opération militaire',
    isPublished: true,
  },

  // Guinée (2)
  {
    name: 'Mariama Bah',
    countryId: 'guinee',
    countryName: 'Guinée',
    role: 'Chroniqueuse',
    yearOfDeath: 2022,
    photoUrl: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=500&fit=crop&crop=face',
    bio: 'Chroniqueuse de la vie politique guinéenne.',
    placeOfDeath: 'Conakry',
    circumstances: 'Tuée lors d\'une répression',
    isPublished: true,
  },
  {
    name: 'Alpha Diallo',
    countryId: 'guinee',
    countryName: 'Guinée',
    role: 'Journaliste web',
    yearOfDeath: 2021,
    photoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=500&fit=crop&crop=face',
    bio: 'Blogueur et journaliste web indépendant.',
    placeOfDeath: 'Kindia',
    circumstances: 'Mort en détention arbitraire',
    isPublished: true,
  },

  // Ghana (2)
  {
    name: 'Kwame Asante',
    countryId: 'ghana',
    countryName: 'Ghana',
    role: 'Correspondant de guerre',
    yearOfDeath: 2021,
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=500&fit=crop&crop=face',
    bio: 'Correspondant de guerre couvrant les régions instables.',
    placeOfDeath: 'Région Nord',
    circumstances: 'Tué lors d\'une couverture de conflit',
    isPublished: true,
  },
  {
    name: 'Akosua Mensah',
    countryId: 'ghana',
    countryName: 'Ghana',
    role: "Journaliste d'enquête",
    yearOfDeath: 2020,
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=500&fit=crop&crop=face',
    bio: 'Journaliste d\'enquête spécialisée dans la corruption.',
    placeOfDeath: 'Accra',
    circumstances: 'Assassinée pour ses investigations',
    isPublished: true,
  },

  // Nigeria (3)
  {
    name: 'Chukwudi Okafor',
    countryId: 'nigeria',
    countryName: 'Nigeria',
    role: "Reporter d'investigation",
    yearOfDeath: 2023,
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&crop=face',
    bio: 'Journaliste d\'investigation couvrant la corruption.',
    placeOfDeath: 'Lagos',
    circumstances: 'Tué après publication d\'enquête sensible',
    isPublished: true,
  },
  {
    name: 'Amina Yusuf',
    countryId: 'nigeria',
    countryName: 'Nigeria',
    role: 'Correspondante',
    yearOfDeath: 2022,
    photoUrl: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=400&h=500&fit=crop&crop=face',
    bio: 'Correspondante couvrant le conflit du nord-est.',
    placeOfDeath: 'Maiduguri',
    circumstances: 'Tuée lors d\'une attaque terroriste',
    isPublished: true,
  },
  {
    name: 'Emeka Nwankwo',
    countryId: 'nigeria',
    countryName: 'Nigeria',
    role: 'Éditorialiste',
    yearOfDeath: 2021,
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop&crop=face',
    bio: 'Éditorialiste critique de la gouvernance.',
    placeOfDeath: 'Enugu',
    circumstances: 'Assassiné pour ses prises de position',
    isPublished: true,
  },
];

// ============================================
// FONCTION D'IMPORT
// ============================================

async function importData() {
  try {
    console.log('🚀 Démarrage de l\'import...\n');

    // 1. Importer les pays
    console.log('📍 Importation des pays...');
    for (const country of countries) {
      const { id, ...data } = country;
      await db.collection('countries').doc(id).set(data);
      console.log(`   ✅ ${country.name}`);
    }
    console.log(`\n✅ ${countries.length} pays importés\n`);

    // 2. Importer les journalistes
    console.log('👤 Importation des journalistes...');
    for (const journalist of journalists) {
      await db.collection('journalists').add(journalist);
      console.log(`   ✅ ${journalist.name}`);
    }
    console.log(`\n✅ ${journalists.length} journalistes importés\n`);

    console.log('🎉 IMPORT TERMINÉ AVEC SUCCÈS !');
    console.log('\n📊 Récapitulatif :');
    console.log(`   - ${countries.length} pays`);
    console.log(`   - ${journalists.length} journalistes`);
    console.log('\n🔍 Vérification dans Firestore Console:');
    console.log('   1. Va sur https://console.firebase.google.com');
    console.log('   2. Firestore Database');
    console.log('   3. Tu dois voir les collections "countries" et "journalists"');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de l\'import :', error);
    process.exit(1);
  }
}

// ============================================
// LANCER L'IMPORT
// ============================================

importData();