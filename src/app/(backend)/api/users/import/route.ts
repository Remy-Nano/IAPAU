import connectDB from "@/lib/mongoose";
import { processCSVImport } from "@/lib/services/importService";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectDB();

    // Traitement multipart form-data pour récupérer le fichier CSV
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier n'a été fourni" },
        { status: 400 }
      );
    }

    const results = await processCSVImport(file);

    return NextResponse.json({
      success: true,
      message: `Import terminé : ${results.imported} utilisateur(s) importé(s)`,
      ...results,
    });
  } catch (error: unknown) {
    console.error("Erreur lors de l'import:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Erreur lors de l'import des utilisateurs";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
