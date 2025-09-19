document.addEventListener('DOMContentLoaded', () => {
  if (typeof initCurrentSubjectPage !== 'function') {
    console.warn('initCurrentSubjectPage is not available.');
    return;
  }

  initCurrentSubjectPage({
    refreshInterval: 750,
    countdownUpdateInterval: 750,
    text: {
      baseTitle: 'Current Subject',
      countdownLabel: 'Time remaining',
      progressLabel: 'Lesson progress',
      freeSlot: 'Free period',
      noLesson: 'No lesson in progress.',
      noNextLesson: 'No further lessons today.',
      error: 'Unable to load data.',
    },
  });
});
