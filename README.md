# CefaLog 🧠

**Diario digitale per chi soffre di emicrania e cefalea**

Traccia i tuoi attacchi, analizza i pattern, condividi i dati con il medico.

[🌐 Live Demo](https://cefalog.vercel.app) · [📱 Installa PWA](#installazione)

<img width="320" height="660" alt="PHONE" src="https://github.com/user-attachments/assets/76694bc5-c28c-4b43-b05a-48234848b18e" />



---

## Il problema
Secondo la [WHO](https://www.who.int/news-room/fact-sheets/detail/headache-disorders), di mal di testa soffre circa il 40% della popolazione mondiale - 3.1 miliardi di persone nel 2021.    
Chi soffre di emicrania sa quanto sia difficile ricordare dettagli precisi durante una visita medica: *"Quando è iniziato? Quanto è durato? Che farmaco hai preso? C'era qualche trigger?"*    
CefaLog risolve questo problema trasformando il tracciamento in un gesto rapido e i dati in insight utili.

---

## Registrazione dettagliata degli episodi di cefalea
Registra ogni attacco indicandone la durata e tutti i dettagli che possono essere utili a te (e al tuo medico) per comprendere meglio il tuo quadro. <br/>
<img width="160" height="330" alt="PHONE" src="https://github.com/user-attachments/assets/c5439186-3f31-4e42-9544-a017fcb97a0f" />

#### Cosa puoi tracciare

| Categoria | Dettagli |
|-----------|----------|
| **Dolore** | Intensità (1-10), tipo (pulsante, sordo, a grappolo), localizzazione |
| **Tempo** | Inizio, fine, durata |
| **Trigger** | Meteo, sonno, alcol, caffeina, stress, ciclo, altro |
| **Sintomi** | Aura, fotofobia, nausea, vertigini |
| **Farmaci** | Nome, dosaggio, efficacia |

---

## Analytics
Ottieni più controllo e comprendi come il tuo corpo reagisce al dolore: le Analytics ti permettono di rintracciare pattern e cause comuni. <br/>
<img width="160" height="330" alt="Analisi" src="https://github.com/user-attachments/assets/bfd4e115-e730-443e-8314-71b98c6583da" />

- Vedi l'andamento del dolore e l'intensità nel tempo
- Controlla le zone più colpite
- Scopri i fattori scatenanti più comuni

#### ...e in più: parlene con il medico!
Puoi scaricare i file in formato .csv, oppure stampare il report in formato PDF, per inviarlo al tuo neurologo di fiducia.

---
## Storico sempre con te
Tutte le registrazioni sono salvate nello storico:<br/>

<img width="160" height="330" alt="Storico 2" src="https://github.com/user-attachments/assets/5dbc2ef1-ea00-4072-b43b-b08e257f188d" /><br/>

Scegli tra la vista a calendario o la vista elenco: ritroverai tutte le tue registrazioni.


---

## Tech Stack

Frontend: React 19, TypeScript, Tailwind CSS
Backend: Supabase (Auth + Database)
Build: Vite 6
Testing: Vitest, Testing Library
Charts: Recharts

---

## Installazione

### PWA (consigliato)

1. Apri [cefalog.vercel.app](https://cefalog.vercel.app)
2. **iOS**: Condividi → Aggiungi a Home
3. **Android**: Menu → Installa app

### Development

```bash
git clone https://github.com/lucadebort/cefalog.git && cd cefalog
pnpm install
cp .env.example .env.local  # Aggiungi credenziali Supabase
pnpm dev
```

---

## Privacy

I tuoi dati di salute sono tuoi. Autenticazione sicura, Row Level Security, nessun tracking, export completo in qualsiasi momento.

---

## License

MIT

<sub>Made with 💜 and a few headaches</sub>



