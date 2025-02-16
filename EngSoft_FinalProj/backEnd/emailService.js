const nodemailer = require('nodemailer');

// Configuração do transporte SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'techmontageequip@gmail.com',  
    pass: 'bvbh gyge msyu zxid'  
  }
});

/// Função para enviar e-mail com anexo
const enviarEmail = async (para, assunto, mensagem, anexo) => {
  try {
    const mailOptions = {
      from: '"Tech" <techmontageequip@gmail.com>',
      to: para,
      subject: assunto,
      text: mensagem,
      html: `<p>${mensagem}</p>`,
      attachments: anexo ? [{  
        filename: anexo.filename,
        content: anexo.content,
        encoding: anexo.encoding
      }] : []
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('E-mail enviado: ', info.messageId);
    return info;
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    throw error;
  }
};

module.exports = enviarEmail;
