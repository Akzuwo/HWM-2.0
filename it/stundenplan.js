document.addEventListener('DOMContentLoaded', () => {
  if (typeof initCurrentSubjectPage !== 'function') {
    console.warn('initCurrentSubjectPage is not available.');
    return;
  }

  initCurrentSubjectPage({
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
    },
  });
});
