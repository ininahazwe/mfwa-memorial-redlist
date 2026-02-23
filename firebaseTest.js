const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

console.log('📋 Configuration Firebase :');
console.log(`   Project ID: ${serviceAccount.project_id}`);
console.log(`   Email: ${serviceAccount.client_email}`);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function test() {
  try {
    console.log('\n🔄 Test de connexion à Firestore...');
    
    // Essaie de lister les collections
    const collections = await db.listCollections();
    console.log(`✅ Connexion réussie !`);
    console.log(`\n📦 Collections existantes :`);
    collections.forEach(col => console.log(`   - ${col.id}`));
    
    if (collections.length === 0) {
      console.log('   (Aucune collection trouvée)');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erreur de connexion :');
    console.error(error.message);
    console.error('\nDiagnostic :');
    console.error(`   - Vérifie serviceAccountKey.json`);
    console.error(`   - Vérifie que Firestore est créée`);
    console.error(`   - Attends 1-2 minutes après avoir créé Firestore`);
    process.exit(1);
  }
}

test();