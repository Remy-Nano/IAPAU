import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

export const sendMagicLink = async (email: string, url: string) => {
  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL || 'matheoalves030@gmail.com',
    subject: 'Votre lien de connexion à IAPAU',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2c3e50; margin-bottom: 20px;">Bonjour !</h1>
        <p style="color: #34495e; margin-bottom: 20px;">
          Voici votre lien de connexion unique à IAPAU. Ce lien expirera dans 24 heures.
        </p>
        <a href="${url}" style="
          display: inline-block;
          background-color: #3498db;
          color: white;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 4px;
          margin-bottom: 20px;
        ">
          Se connecter maintenant
        </a>
        <p style="color: #34495e;">
          Si vous n'avez pas demandé ce lien, vous pouvez l'ignorer en toute sécurité.
        </p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi du mail :', error);
    throw error;
  }
};
