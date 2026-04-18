# bymilos-chatbot

AI chatbot widget pro bymilos.cz a klientské weby. Bezplatný provoz přes Gemini 2.0 Flash.

---

## Deploy (5 minut)

### 1. Získej Gemini API klíč (zdarma)
1. Jdi na [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Klikni **Create API key**
3. Zkopíruj klíč

### 2. Nasaď na Vercel
```bash
npm install -g vercel
cd bymilos-chatbot
vercel
```
Při prvním deployi Vercel provede průvodce. Vyber:
- Framework: **Other**
- Build command: _(prázdné)_
- Output directory: _(prázdné)_

### 3. Nastav API klíč
V Vercel dashboardu → projekt → **Settings → Environment Variables**:
```
GEMINI_API_KEY = tvůj_klíč
```
Pak znovu nasaď: `vercel --prod`

### 4. Embed na web
Vlož před `</body>` na jakémkoliv webu:

```html
<script>
  window.chatbotConfig = {
    botName: 'Asistent Miloše',
    greeting: 'Ahoj! Jak vám mohu pomoci?',
    primaryColor: '#1a2e4a',
    accentColor: '#2d6cdf',
    apiUrl: 'https://TVŮJ-PROJEKT.vercel.app/api/chat',
    position: 'right'
  };
</script>
<script src="https://TVŮJ-PROJEKT.vercel.app/widget.js"></script>
```

---

## Lokální vývoj

```bash
cp .env.example .env.local
# Vlož svůj GEMINI_API_KEY do .env.local
npm install
npm run dev
# Otevři: http://localhost:3000
```

---

## Přizpůsobení pro klienta

Uprav `api/chat.js` — sekci `DEFAULT_SYSTEM_PROMPT`:
- Jméno firmy, služby, ceny
- Tón komunikace
- Kontaktní údaje

Nebo pošli vlastní `systemPrompt` v konfigu widgetu.

---

## Struktura projektu

```
bymilos-chatbot/
├── api/
│   └── chat.js          # Serverless funkce → Gemini API
├── public/
│   └── widget.js        # Embeddable chat widget
├── demo.html            # Testovací stránka
├── vercel.json          # Vercel konfigurace
├── package.json
└── .env.example
```

---

## Ceny provozu

| Provoz | Gemini 2.0 Flash |
|---|---|
| Do 1 500 req/den | Zdarma |
| Nad limit | ~$0.075 / 1M tokenů |

Pro běžného klienta (živnostník) = **zdarma navždy**.
