const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Missing MONGODB_URI for E2E cleanup");
  process.exit(1);
}

async function cleanup() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  console.log(`✅ Connected to MongoDB (db=${db.databaseName})`);

  const usersCol = db.collection("users");
  const conversationsCol = db.collection("conversations");
  const evaluationsCol = db.collection("evaluations");
  const hackathonsCol = db.collection("hackathons");

  const examiner = await usersCol.findOne({
    email: "examinateur@exemple.com",
  });
  const student = await usersCol.findOne({
    email: "matheoalves030@gmail.com",
  });

  const examinerId = examiner ? String(examiner._id) : null;
  const studentId = student ? String(student._id) : null;

  if (examinerId) {
    const evalRes = await evaluationsCol.deleteMany({ examinerId });
    console.log(`🧹 Removed evaluations for examinerId: ${evalRes.deletedCount}`);
  }

  if (studentId) {
    const convRes = await conversationsCol.deleteMany({ studentId });
    console.log(`🧹 Removed conversations for studentId: ${convRes.deletedCount}`);
  }

  const hackRes = await hackathonsCol.deleteMany({
    nom: { $regex: /^E2E Hackathon/i },
  });
  if (hackRes.deletedCount) {
    console.log(`🧹 Removed E2E hackathons: ${hackRes.deletedCount}`);
  }

  await mongoose.disconnect();
  console.log("✅ E2E cleanup completed");
}

cleanup().catch((err) => {
  console.error(err);
  process.exit(1);
});
