import sgMail from "@sendgrid/mail";

// Configuration SendGrid
const sendgridFromEmail =
  process.env.SENDGRID_FROM_EMAIL || "matheoalves030@gmail.com";

if (!process.env.SENDGRID_API_KEY) {
  console.warn(
    "SENDGRID_API_KEY non définie - l'envoi d'email ne fonctionnera pas"
  );
} else {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

console.log("SendGrid configuré avec l'email expéditeur:", sendgridFromEmail);

export const sendMagicLink = async (email: string, link: string) => {
  try {
    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Format d'email invalide");
    }

    // Validation du lien
    if (!link.startsWith("http://") && !link.startsWith("https://")) {
      throw new Error("URL invalide");
    }

    console.log("🚀 Début de l'envoi de l'email");
    console.log("Email:", email);
    console.log("Lien:", link);
    console.log("Email de l'expéditeur:", sendgridFromEmail);

    const msg = {
      to: email,
      from: sendgridFromEmail,
      subject: "Votre lien magique",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Bonjour !</h2>
          <p style="color: #666;">Voici votre lien de connexion unique :</p>
          <a href="${link}" 
             style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; 
                    text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Se connecter
          </a>
          <p style="color: #666;">Ce lien expirera dans 10 minutes.</p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            Si vous n'avez pas demandé de connexion, vous pouvez ignorer cet email.
          </p>
        </div>
      `,
    };

    console.log("⚡ Message configuré, envoi en cours...");

    await sgMail.send(msg);

    console.log("✅ Email envoyé avec succès");
    return true;
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de l'email:", error);
    throw error instanceof Error
      ? error
      : new Error("Erreur lors de l'envoi de l'email");
  }
};
