document.addEventListener('DOMContentLoaded', () => {
  if (typeof initCurrentSubjectPage !== 'function') {
    console.warn('initCurrentSubjectPage is not available.');
    return;
  }

  const controller = initCurrentSubjectPage({
    refreshInterval: 15000,
    countdownUpdateInterval: 1000,
    text: {
      baseTitle: 'Current Subject',
      countdownLabel: 'Time remaining',
      progressLabel: 'Lesson progress',
      freeSlot: 'Free period',
      noLesson: 'No lesson in progress.',
      noNextLesson: 'No further lessons today.',
      error: 'Unable to load data.',
      unauthorized: 'Please sign in and make sure you are assigned to a class to view the current subject.',
      featureUnavailable: 'This feature is not yet available for your class.'
    },
  });

  if (window.hmClassSelector) {
    const permissions = window.hmCalendar ? window.hmCalendar.permissions : null;
    const selector = window.hmClassSelector.create({
      container: '[data-class-selector]',
      select: '[data-class-select]',
      permissions,
      text: {
        label: 'Class',
        placeholder: 'Select class',
        loading: 'Loading classes…',
        error: 'Unable to load classes.',
        changeError: 'Unable to change class.',
        required: 'Please choose a class to use this feature.'
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
      console.error('Failed to initialise class selector:', error);
    });
  }
});
