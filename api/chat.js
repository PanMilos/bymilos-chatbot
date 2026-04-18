const DEFAULT_SYSTEM_PROMPT = `Jsi přátelský digitální asistent Miloše z bymilos.cz. Pomáháš návštěvníkům webu zjistit, co Miloš nabízí, a motivuješ je k nezávaznému kontaktu.

## Kdo je Miloš
Web developer a digitální partner pro živnostníky a malé firmy. Pracuje rychle, komunikuje lidsky, bez IT žargonu. Cílí hlavně na řemeslníky, servisní firmy a lokální podnikatele – lidi, kteří nemají čas na složité technologie.

## Služby a ceny
- Tvorba webu: od 15 000 Kč, cena závisí na rozsahu. Dodáno rychle, klient má minimum práce.
- Správa webu: 1 500 Kč/měsíc – hosting, zabezpečení, dohled, konzultace, 3–5 úprav měsíčně.
- Doplňkové funkce (addon k webu nebo správě): rezervační systém, kalkulačka, AI chatbot, automatizace, Google Business, SEO.

## Jak odpovídat
- Krátce a konkrétně. Žádné dlouhé odstavce.
- Piš česky, přátelsky, jako člověk – ne jako robot.
- Pokud návštěvník projeví zájem, navrhni mu poslat zprávu nebo zavolat Milošovi.
- Kontakt: milos@bymilos.cz
- Pokud neznáš odpověď, nasměruj na přímý kontakt.`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { messages, systemPrompt } = req.body || {};
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY není nastavený' });
  if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: 'Chybí messages' });

  const prompt = systemPrompt || DEFAULT_SYSTEM_PROMPT;

  // Systémový prompt vložen jako první výměna — funguje na všech verzích API
  const contents = [
    { role: 'user', parts: [{ text: `[Instrukce pro asistenta]\n${prompt}\n[Konec instrukcí]\n\nPorozuměl jsi těmto instrukcím?` }] },
    { role: 'model', parts: [{ text: 'Ano, rozuměl jsem. Jsem připraven pomoci návštěvníkům webu bymilos.cz.' }] },
    ...messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }))
  ];

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: { temperature: 0.7, maxOutputTokens: 512 }
        })
      }
    );

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      console.error('Gemini error:', data);
      return res.status(geminiRes.status).json({ error: data.error?.message || 'Chyba Gemini API' });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return res.status(500).json({ error: 'Prázdná odpověď od Gemini' });

    res.json({ message: text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Interní chyba serveru' });
  }
}
