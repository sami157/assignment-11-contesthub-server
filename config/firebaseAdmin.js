var admin = require("firebase-admin");

var serviceAccount = require("../admin-key.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});