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

## Features
- Registrazione dettagliata degli episodi di cefalea
- Tracciamento intensità, localizzazione, sintomi e trigger
- Dashboard con statistiche e grafici
- Esportazione dati in CSV
- PWA installabile su iOS e Android
- Modalità offline con sincronizzazione

<table>
  <tr>
    <td align="center" width="33%">
      <img src="screenshots/intensita.png" width="220"/><br/>
      <strong>Intensità Dolore</strong><br/>
      <sub>Slider visuale 1-10 con feedback immediato</sub>
    </td>
    <td align="center" width="33%">
      <img src="screenshots/mappa.png" width="220"/><br/>
      <strong>Mappa Interattiva</strong><br/>
      <sub>Tocca dove fa male: fronte, tempie, nuca, occhi</sub>
    </td>
    <td align="center" width="33%">
      <img src="screenshots/analytics.png" width="220"/><br/>
      <strong>Analytics</strong><br/>
      <sub>Zone colpite, trend 30gg, orari frequenti</sub>
    </td>
  </tr>
</table>

<table>
  <tr>
    <td align="center" width="50%">
      <img src="screenshots/home.png" width="220"/><br/>
      <strong>Dashboard</strong><br/>
      <sub>Dolore medio, giorni liberi, storico recente</sub>
    </td>
    <td align="center" width="50%">
      <img width="160" height="330" alt="Storico 2" src="https://github.com/user-attachments/assets/5dbc2ef1-ea00-4072-b43b-b08e257f188d" /><br/>
      <p>
         <strong>Storico</strong>
      </p>
      <sub>Calendario + lista con filtri e dettagli</sub>
    </td>
  </tr>
</table>

---

## Cosa puoi tracciare

| Categoria | Dettagli |
|-----------|----------|
| **Dolore** | Intensità (1-10), tipo (pulsante, sordo, a grappolo), localizzazione |
| **Tempo** | Inizio, fine, durata |
| **Trigger** | Meteo, sonno, alcol, caffeina, stress, ciclo, altro |
| **Sintomi** | Aura, fotofobia, nausea, vertigini |
| **Farmaci** | Nome, dosaggio, efficacia |

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



