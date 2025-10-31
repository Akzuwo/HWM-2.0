document.addEventListener('DOMContentLoaded', () => {
  if (typeof initCurrentSubjectPage !== 'function') {
    console.warn('initCurrentSubjectPage is not available.');
    return;
  }

  const controller = initCurrentSubjectPage({
    refreshInterval: 750,
    countdownUpdateInterval: 750,
    text: {
      baseTitle: 'Materia attuale',
      countdownLabel: 'Tempo rimanente',
      progressLabel: 'Avanzamento della lezione',
      freeSlot: 'Ora libera',
      noLesson: 'Nessuna lezione in corso.',
      noNextLesson: "Nessun'altra lezione oggi.",
      error: 'Impossibile caricare i dati.',
      unauthorized: 'Accedi e assicurati di essere assegnato a una classe per vedere la materia attuale.',
      featureUnavailable: 'Questa funzione non è ancora disponibile per la tua classe.'
    },
  });

  if (window.hmClassSelector) {
    const permissions = window.hmCalendar ? window.hmCalendar.permissions : null;
    const selector = window.hmClassSelector.create({
      container: '[data-class-selector]',
      select: '[data-class-select]',
      permissions,
      text: {
        label: 'Classe',
        placeholder: 'Seleziona classe',
        loading: 'Caricamento delle classi…',
        error: 'Impossibile caricare le classi.',
        changeError: 'Impossibile cambiare classe.',
        required: 'Seleziona una classe per utilizzare questa funzione.'
      },
      onError: (message) => {
        if (typeof window.showOverlay === 'function') {
          window.showOverlay(message, 'error');
        } else {
          console.error(message);
        }
      },
      onClassChange: () => {
        if (controller && typeof controller.refresh === 'function') {
          controller.refresh();
        }
      }
    });
    selector.init().catch((error) => {
      console.error('Impossibile inizializzare il selettore di classe:', error);
    });
  }
});
