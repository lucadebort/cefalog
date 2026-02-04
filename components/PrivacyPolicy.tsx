import React from 'react';
import { X, Shield } from 'lucide-react';
import { Button } from './ui/Button';

interface PrivacyPolicyProps {
  onClose: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl border border-gray-800 w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-white">Privacy Policy</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm text-muted">
          <p className="text-white font-medium">Ultimo aggiornamento: Febbraio 2026</p>

          <section>
            <h3 className="text-white font-bold mb-2">1. Dati raccolti</h3>
            <p>CefaLog raccoglie i seguenti dati personali e sanitari:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Email e password (per l'autenticazione)</li>
              <li>Dati sulle cefalee: data, ora, intensità, localizzazione del dolore</li>
              <li>Informazioni sui farmaci assunti</li>
              <li>Trigger e sintomi associati</li>
              <li>Note personali</li>
            </ul>
          </section>

          <section>
            <h3 className="text-white font-bold mb-2">2. Finalità del trattamento</h3>
            <p>I tuoi dati sono utilizzati esclusivamente per:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Permetterti di monitorare le tue cefalee nel tempo</li>
              <li>Generare statistiche personali sul tuo stato di salute</li>
              <li>Esportare i dati per condividerli con il tuo medico</li>
            </ul>
          </section>

          <section>
            <h3 className="text-white font-bold mb-2">3. Base giuridica</h3>
            <p>
              Il trattamento dei tuoi dati sanitari si basa sul <strong className="text-white">consenso esplicito</strong> che
              fornisci al momento della registrazione (Art. 9(2)(a) GDPR).
            </p>
          </section>

          <section>
            <h3 className="text-white font-bold mb-2">4. Conservazione dei dati</h3>
            <p>
              I tuoi dati sono conservati su server sicuri forniti da Supabase (con sede nell'UE).
              Puoi richiedere la cancellazione completa dei tuoi dati in qualsiasi momento.
            </p>
          </section>

          <section>
            <h3 className="text-white font-bold mb-2">5. I tuoi diritti</h3>
            <p>Ai sensi del GDPR, hai diritto a:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong className="text-white">Accesso:</strong> richiedere una copia dei tuoi dati</li>
              <li><strong className="text-white">Rettifica:</strong> correggere dati inesatti</li>
              <li><strong className="text-white">Cancellazione:</strong> richiedere l'eliminazione dei dati</li>
              <li><strong className="text-white">Portabilità:</strong> esportare i tuoi dati (funzione CSV)</li>
              <li><strong className="text-white">Revoca:</strong> ritirare il consenso in qualsiasi momento</li>
            </ul>
          </section>

          <section>
            <h3 className="text-white font-bold mb-2">6. Sicurezza</h3>
            <p>
              Utilizziamo crittografia TLS per la trasmissione dei dati e accesso autenticato
              per proteggere le tue informazioni sanitarie.
            </p>
          </section>

          <section>
            <h3 className="text-white font-bold mb-2">7. Contatti</h3>
            <p>
              Per esercitare i tuoi diritti o per domande sulla privacy, contattaci all'indirizzo
              email indicato nell'app.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800">
          <Button fullWidth onClick={onClose}>
            Ho capito
          </Button>
        </div>
      </div>
    </div>
  );
};
