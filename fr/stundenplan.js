document.addEventListener('DOMContentLoaded', () => {
  if (typeof initCurrentSubjectPage !== 'function') {
    console.warn('initCurrentSubjectPage is not available.');
    return;
  }

  const controller = initCurrentSubjectPage({
    refreshInterval: 750,
    countdownUpdateInterval: 750,
    text: {
      baseTitle: 'Matière actuelle',
      countdownLabel: 'Temps restant',
      progressLabel: 'Progression du cours',
      freeSlot: 'Créneau libre',
      noLesson: 'Aucun cours en cours.',
      noNextLesson: 'Pas d’autres cours aujourd’hui.',
      error: 'Impossible de charger les données.',
      unauthorized: 'Connecte-toi et assure-toi d’être affecté·e à une classe pour voir la matière actuelle.',
      featureUnavailable: 'Cette fonctionnalité n’est pas encore disponible pour ta classe.'
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
        placeholder: 'Sélectionner une classe',
        loading: 'Chargement des classes…',
        error: 'Impossible de charger les classes.',
        changeError: 'Impossible de changer de classe.',
        required: 'Sélectionne une classe pour utiliser cette fonctionnalité.'
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
      console.error('La sélection de classe n’a pas pu être initialisée :', error);
    });
  }
});
