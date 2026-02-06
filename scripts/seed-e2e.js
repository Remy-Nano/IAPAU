const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Missing MONGODB_URI for E2E seed");
  process.exit(1);
}

const now = new Date();

const users = [
  {
    prenom: "Admin",
    nom: "Systeme",
    email: "admin@exemple.com",
    role: "admin",
    password: "admin123",
  },
  {
    prenom: "Matheo",
    nom: "Alves",
    email: "examinateur@exemple.com",
    role: "examiner",
    password: "examiner123",
  },
  {
    prenom: "Matheo",
    nom: "Alves",
    email: "matheoalves030@gmail.com",
    role: "student",
    password: "student123",
  },
];

async function seed() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  console.log(`✅ Connected to MongoDB (db=${db.databaseName})`);

  const usersCol = db.collection("users");
  const conversationsCol = db.collection("conversations");
  const evaluationsCol = db.collection("evaluations");

  const userDocs = [];
  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    const doc = {
      prenom: u.prenom,
      nom: u.nom,
      email: u.email.toLowerCase(),
      passwordHash,
      role: u.role,
      numeroEtudiant: u.role === "student" ? "STU123" : "",
      tokensAuthorized: 0,
      tokensUsed: 0,
      magicLink: { token: "", expiresAt: now },
      profilEtudiant: {
        niveauFormation: "",
        typeEtude: "",
        groupId: null,
      },
      profilJury: {
        niveauDiplome: "",
        posteOccupe: "",
        secteurActivite: "",
        anneesExperience: 0,
        nombreETPEmployeur: 0,
        expertises: [],
      },
      consentementRGPD: false,
      createdAt: now,
      updatedAt: now,
    };

    await usersCol.updateOne(
      { email: doc.email },
      { $set: doc },
      { upsert: true }
    );

    const stored = await usersCol.findOne({ email: doc.email });
    userDocs.push(stored);
  }

  const student = userDocs.find((u) => u && u.role === "student");
  const examiner = userDocs.find((u) => u && u.role === "examiner");

  if (!student || !examiner) {
    throw new Error("Seed failed: missing student or examiner user");
  }

  const studentId = String(student._id);
  const examinerId = String(examiner._id);

  await evaluationsCol.deleteMany({ examinerId });
  await conversationsCol.deleteMany({ studentId });

  await conversationsCol.insertOne({
    hackathonId: new mongoose.Types.ObjectId().toString(),
    tacheId: new mongoose.Types.ObjectId().toString(),
    studentId,
    groupId: new mongoose.Types.ObjectId().toString(),
    modelName: "openai",
    maxTokens: 512,
    temperature: 0.7,
    messages: [
      {
        role: "student",
        content: "Seed E2E",
        createdAt: now,
      },
    ],
    versionFinale: {
      promptFinal: "Seed E2E",
      reponseIAFinale: "",
      soumisLe: now,
      evaluationEtudiant: {
        note: 4,
        comment: "E2E: évaluation ajoutée correctement.",
        examinerId,
        date: now,
      },
    },
    statistiquesIA: {
      modelUtilise: "openai",
      tokensTotal: 0,
    },
    createdAt: now,
    updatedAt: now,
  });

  const userCount = await usersCol.countDocuments();
  const convCount = await conversationsCol.countDocuments();
  console.log(`✅ Seed counts: users=${userCount}, conversations=${convCount}`);

  await mongoose.disconnect();
  console.log("✅ E2E seed completed");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
