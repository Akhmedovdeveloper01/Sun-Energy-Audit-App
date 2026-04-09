export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(200).end();
  
    const { message } = req.body;
    if (!message) return res.status(200).end();
  
    const chatId = message.chat.id;
    const text = message.text || '';
    const firstName = message.from?.first_name || '';
    const username = message.from?.username || '';
  
    const BOT_TOKEN = process.env.BOT_TOKEN;
  
    // /myid command
    if (text === '/myid' || text.startsWith('/myid')) {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: `👤 Sizning Telegram ID ingiz:\n\n<code>${chatId}</code>\n\nShu raqamni admin ga yuboring.`,
          parse_mode: 'HTML',
        }),
      });
    }
  
    // /start command
    if (text === '/start') {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: `Salom ${firstName}! 👋\n\nID ingizni bilish uchun /myid yuboring.`,
        }),
      });
    }
  
    return res.status(200).end();
  }