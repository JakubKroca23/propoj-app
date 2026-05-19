const { ImapFlow } = require('imapflow');
const nodemailer = require('nodemailer');

/**
 * Appwrite Function: Email Proxy (IMAP/SMTP Bridge)
 * 
 * JSON payload format:
 * {
 *   "action": "listMessages" | "getMessage" | "sendMessage",
 *   "config": {
 *     "imapHost": "...",
 *     "imapPort": 993,
 *     "imapSecure": true,
 *     "smtpHost": "...",
 *     "smtpPort": 465,
 *     "smtpSecure": true,
 *     "username": "...",
 *     "password": "..."
 *   },
 *   "params": {
 *     // action specific params
 *     "messageId": "...", // for getMessage
 *     "to": "...",       // for sendMessage
 *     "subject": "...",  // for sendMessage
 *     "body": "..."      // for sendMessage
 *   }
 * }
 */
module.exports = async function (context) {
  const { req, res, log, error } = context;

  if (req.method !== 'POST') {
    return res.json({ success: false, error: 'Metoda musí být POST.' }, 400);
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch (err) {
    return res.json({ success: false, error: 'Neplatný JSON payload.' }, 400);
  }

  const { action, config, params } = body || {};

  if (!action || !config) {
    return res.json({ success: false, error: 'Chybí parametry action nebo config.' }, 400);
  }

  const { username, password, imapHost, imapPort, imapSecure, smtpHost, smtpPort, smtpSecure } = config;

  if (!username || !password) {
    return res.json({ success: false, error: 'Chybí e-mailové přihlašovací údaje.' }, 400);
  }

  // --- ODESÍLÁNÍ E-MAILŮ (SMTP) ---
  if (action === 'sendMessage') {
    if (!smtpHost || !smtpPort) {
      return res.json({ success: false, error: 'Konfigurace SMTP není kompletní.' }, 400);
    }
    if (!params || !params.to || !params.subject || !params.body) {
      return res.json({ success: false, error: 'Chybí příjemce, předmět nebo tělo zprávy.' }, 400);
    }

    try {
      log(`Připojování k SMTP serveru ${smtpHost}:${smtpPort}...`);
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort),
        secure: smtpSecure === true || smtpPort == 465,
        auth: {
          user: username,
          pass: password,
        },
      });

      log(`Odesílání e-mailu pro: ${params.to}...`);
      const info = await transporter.sendMail({
        from: username,
        to: params.to,
        subject: params.subject,
        text: params.body,
        html: params.body.replace(/\n/g, '<br>'),
      });

      log(`E-mail úspěšně odeslán: ${info.messageId}`);
      return res.json({
        success: true,
        messageId: info.messageId,
        response: info.response,
      });
    } catch (err) {
      error(`Chyba při odesílání přes SMTP: ${err.message}`);
      return res.json({ success: false, error: `Selhalo odeslání: ${err.message}` }, 500);
    }
  }

  // --- NAČÍTÁNÍ ZPRÁV (IMAP) ---
  if (action === 'listMessages' || action === 'getMessage') {
    if (!imapHost || !imapPort) {
      return res.json({ success: false, error: 'Konfigurace IMAP není kompletní.' }, 400);
    }

    const client = new ImapFlow({
      host: imapHost,
      port: parseInt(imapPort),
      secure: imapSecure === true || imapPort == 993,
      auth: {
        user: username,
        pass: password,
      },
      logger: false,
    });

    try {
      log(`Připojování k IMAP serveru ${imapHost}:${imapPort}...`);
      await client.connect();
      log('Připojeno k IMAP. Otevírání složky INBOX...');

      // Otevřeme INBOX
      const lock = await client.getMailboxLock('INBOX');
      try {
        if (action === 'listMessages') {
          log('Načítání seznamu zpráv...');
          const messages = [];
          
          // Načteme posledních 20 zpráv
          const status = await client.status('INBOX', { messages: true });
          const totalMessages = status.messages;
          const rangeStart = Math.max(1, totalMessages - 19);
          const rangeEnd = totalMessages;

          if (totalMessages > 0) {
            for await (const msg of client.fetch(`${rangeStart}:${rangeEnd}`, {
              envelope: true,
              bodyStructure: true,
              uid: true,
            })) {
              messages.push({
                id: msg.uid.toString(),
                uid: msg.uid,
                subject: msg.envelope.subject || '(Bez předmětu)',
                from: msg.envelope.from && msg.envelope.from[0]
                  ? `${msg.envelope.from[0].name || ''} <${msg.envelope.from[0].address || ''}>`.trim()
                  : 'Neznámý odesílatel',
                to: msg.envelope.to && msg.envelope.to[0]
                  ? `${msg.envelope.to[0].name || ''} <${msg.envelope.to[0].address || ''}>`.trim()
                  : '',
                date: msg.envelope.date ? msg.envelope.date.toISOString() : new Date().toISOString(),
                read: msg.flags ? msg.flags.includes('\\Seen') : false,
                bodySnippet: '', // získáme dodatečně nebo necháme prázdné pro list
              });
            }
          }

          // Seřadíme sestupně (nejnovější nahoře)
          messages.reverse();
          log(`Načteno ${messages.length} zpráv.`);
          return res.json({ success: true, messages });
        }

        if (action === 'getMessage') {
          const uid = parseInt(params.messageId);
          if (isNaN(uid)) {
            return res.json({ success: false, error: 'Chybí nebo je neplatné messageId.' }, 400);
          }

          log(`Načítání detailu zprávy UID: ${uid}...`);
          let bodyText = '';
          let bodyHtml = '';

          // Stáhneme zdrojový text zprávy
          const message = await client.fetchOne(uid.toString(), {
            source: true,
            uid: true
          }, { uid: true });

          if (!message) {
            return res.json({ success: false, error: 'Zpráva nebyla nalezena.' }, 404);
          }

          // Pro účely zjednodušení a spolehlivosti v serverless získáme část obsahu
          // V reálné funkci by se použil mailparser, zde vytvoříme jednoduchou extrakci
          const sourceStr = message.source.toString();
          
          // Extrakce textu/html ze zdroje
          // Pro produkci lze přidat knihovnu mailparser, pro teď uděláme bezpečné vyčištění těla
          const parts = sourceStr.split(/\r?\n\r?\n/);
          const header = parts[0];
          const bodyPayload = parts.slice(1).join('\n\n');

          // Základní parsování textu
          bodyText = bodyPayload
            .replace(/Content-Transfer-Encoding: [a-zA-Z0-9-=\/]+/g, '')
            .replace(/Content-Type: [a-zA-Z0-9-=\/; "]+/g, '')
            .substring(0, 10000); // limit 10kb

          return res.json({
            success: true,
            body: bodyText,
            html: sourceStr.includes('text/html') ? bodyText : undefined
          });
        }
      } finally {
        lock.release();
      }

      await client.logout();
    } catch (err) {
      error(`Chyba při práci s IMAP: ${err.message}`);
      try {
        await client.logout();
      } catch (le) {}
      return res.json({ success: false, error: `Selhalo IMAP spojení: ${err.message}` }, 500);
    }
  }

  return res.json({ success: false, error: 'Nepodporovaná akce.' }, 400);
};
