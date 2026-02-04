# CefaLog

Diario digitale per il monitoraggio delle cefalee. Traccia i tuoi mal di testa, analizza i pattern e condividi i dati con il tuo medico.

## Funzionalità

- Registrazione dettagliata degli episodi di cefalea
- Tracciamento intensità, localizzazione, sintomi e trigger
- Dashboard con statistiche e grafici
- Esportazione dati in CSV
- PWA installabile su iOS e Android
- Modalità offline con sincronizzazione

## Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS
- **Backend:** Supabase (Auth + Database)
- **Build:** Vite 6
- **Testing:** Vitest, Testing Library
- **Charts:** Recharts

## Setup Locale

### Prerequisiti

- Node.js 18+
- Account Supabase (gratuito)

### Installazione

1. Clona il repository:
   ```bash
   git clone https://github.com/tuouser/cefalog.git
   cd cefalog
   ```

2. Installa le dipendenze:
   ```bash
   npm install
   ```

3. Configura le variabili d'ambiente:
   ```bash
   cp .env.example .env.local
   ```

   Modifica `.env.local` con le tue credenziali Supabase:
   ```
   VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

4. Avvia l'app in sviluppo:
   ```bash
   npm run dev
   ```

5. Apri http://localhost:3000

## Script Disponibili

| Comando | Descrizione |
|---------|-------------|
| `npm run dev` | Avvia il server di sviluppo |
| `npm run build` | Build di produzione |
| `npm run preview` | Anteprima build di produzione |
| `npm run test` | Avvia i test in watch mode |
| `npm run test:run` | Esegue i test una volta |

## Configurazione Supabase

1. Crea un nuovo progetto su [supabase.com](https://supabase.com)

2. Esegui questa query SQL per creare la tabella:

```sql
create table headache_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  started_at timestamptz not null,
  ended_at timestamptz,
  intensity integer not null check (intensity >= 1 and intensity <= 10),
  quality text not null,
  locations text[] default '{}',
  has_aura boolean default false,
  is_light_sensitive boolean default false,
  is_sound_sensitive boolean default false,
  is_smell_sensitive boolean default false,
  has_nausea boolean default false,
  worsened_by_movement boolean default false,
  triggers text[] default '{}',
  medication text default '',
  food text default '',
  notes text default '',
  created_at timestamptz default now()
);

-- Row Level Security
alter table headache_logs enable row level security;

create policy "Users can only access their own logs"
  on headache_logs for all
  using (auth.uid() = user_id);
```

3. Copia URL e anon key da Settings > API

## Deploy

L'app può essere deployata su qualsiasi hosting statico:

- **Vercel:** `npx vercel`
- **Netlify:** collega il repo GitHub
- **GitHub Pages:** usa `npm run build` e deploya la cartella `dist`

Ricorda di configurare le variabili d'ambiente nel pannello del tuo hosting.

## Privacy e Sicurezza

CefaLog gestisce dati sanitari sensibili. Assicurati di:

- Non committare mai il file `.env.local`
- Configurare correttamente le Row Level Security su Supabase
- Leggere la Privacy Policy integrata nell'app

## Licenza

MIT
