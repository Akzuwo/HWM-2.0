(function (global) {
  const translations = {
    de: {
      common: {
        appName: 'Homework Manager',
        nav: {
          home: '🏠 Start',
          calendar: '📅 Kalender',
          upcoming: '🔔 Upcoming Events',
          grades: '📊 Notenrechner',
          currentSubject: '🕒 Aktuelles Fach',
          logout: '🚪 Abmelden',
          primary: 'Hauptnavigation',
          toggle: 'Navigationsmenü umschalten',
          language: 'Sprache ändern',
        },
        footer: {
          copyright: '©️ Timo Wigger 2025',
          contact: 'Kontakt',
          imprint: 'Impressum',
          privacy: 'Datenschutz',
          changelog: 'Changelog',
          navigation: 'Footer-Navigation',
        },
        language: {
          menuLabel: 'Sprache auswählen',
        },
      },
      home: {
        pageTitle: 'Homework Manager',
        heroTitle: 'Homework Manager 2.0',
        description: {
          lead:
            'Der Homework Manager entstand, um Hausaufgaben, Prüfungen und Projekte transparent für die ganze Klasse bereitzustellen.',
          body:
            'Statt verstreuter Chats und vergessener Notizen bündelt die Plattform Termine, Erinnerungen und praktische Werkzeuge in einer klaren Oberfläche – jederzeit verfügbar und gemeinsam nutzbar.',
        },
        release: {
          title: 'Release 2.0',
          date: 'Oktober 2025',
          summary:
            'Wir feiern den Start von Homework Manager 2.0 – mit frischem Look and Feel und vielen Verbesserungen im Hintergrund. Die Highlights des Releases folgen in Kürze.',
          highlights: {
            design: 'Modernes Dark-Theme-Design für Kalender, Fächerübersicht und Tools.',
            performance: 'Schnellere APIs für reibungsloses Laden der Hausaufgaben.',
            overlays: 'Überarbeitete Overlays für komfortableres Bearbeiten von Einträgen.',
          },
          cta: 'Mehr erfahren',
        },
      },
      changelog: {
        pageTitle: 'Changelog',
        title: 'Changelog',
        subtitle:
          'Hier findest du die Release-Notizen zum Homework Manager – inklusive der Highlights aus Version 2.0 und früheren Updates.',
        back: '← Zurück zur Übersicht',
        release: {
          title: 'Release 2.0',
          date: 'Oktober 2025',
          summary:
            'Homework Manager 2.0 liefert ein vollständig erneuertes Erlebnis mit frischen Funktionen. Das sind die Highlights des Releases.',
          items: {
            design:
              'Rundum neu gestaltete Benutzeroberfläche mit harmonischem Dark-Theme und präziser Typografie.',
            events: 'Frisches „Event“-Feature für spontane Veranstaltungen, AGs und besondere Termine.',
            dayView: 'Neue Tagesübersicht bündelt Aufgaben, Prüfungen und Events in einem fokussierten Feed.',
            account:
              'Grundstein für das kommende Account-System (Work in Progress) – die Teamarbeit ist vorbereitet.',
          },
        },
        archive: {
          title: 'Frühere Versionen',
          release171: {
            title: 'Release 1.7.1',
            summary:
              'Release 1.7.1 sorgt für mehr Tempo im Kalender und poliert das Interface mit gezielten Verbesserungen.',
            items: {
              calendar: 'Admins können Kalendereinträge direkt anlegen und bei Bedarf sofort bearbeiten.',
              uiFixes: 'Mehrere Darstellungsfehler im UI wurden behoben.',
              formatting: 'Aufgabenbeschreibungen unterstützen jetzt Fett- und Kursivformatierungen.',
            },
            patch01: {
              title: 'Patch 0x01',
              items: {
                overlayButton: 'Der Schließen-Button der Kalender-Overlays wird wieder korrekt dargestellt.',
                uiTweaks: 'Weitere visuelle Feinschliffe an UI-Elementen – ohne Änderungen an ihren Funktionen.',
              },
            },
            patch02: {
              title: 'Patch 0x02',
              items: {
                scheduleUi: 'Stundenplan-Ansicht optisch überarbeitet.',
              },
            },
          },
        },
      },
      calendar: {
        pageTitle: 'Kalender',
        heading: '📅 Kalender',
        description: 'Behalte Hausaufgaben, Prüfungen und Events in einer dunklen, klar strukturierten Ansicht im Blick.',
        status: {
          loading: 'Kalender wird geladen …',
          error: 'Fehler beim Laden der Kalendereinträge!',
          unauthorized: 'Bitte melde dich an und stelle sicher, dass du einer Klasse zugeordnet bist, um den Kalender zu sehen.',
        },
        views: {
          month: 'Monat',
          week: 'Woche',
          day: 'Tag',
        },
        monthNav: {
          label: 'Monatsnavigation',
          previous: 'Vorheriger Monat',
          next: 'Nächster Monat',
          current: 'Aktueller Monat',
        },
        actions: {
          create: {
            label: 'Neuer Eintrag',
            tooltip: 'Neuen Kalendereintrag erstellen',
            disabled: 'Nur Admins können Einträge erstellen',
          },
          export: {
            label: 'Exportieren',
            tooltip: 'Kalender als ICS exportieren',
            loading: 'Exportieren …',
            success: 'Kalender erfolgreich exportiert.',
            error: 'Fehler beim Exportieren des Kalenders.',
            fileName: 'homework-calendar.ics',
            unauthorized: 'Melde dich an und lass dich einer Klasse zuordnen, um den Kalender zu exportieren.',
          },
          back: {
            label: 'Zur Übersicht',
            tooltip: 'Zurück zur Startseite',
          },
        },
        actionBar: {
          label: 'Kalender Aktionen',
        },
        weekStrip: {
          label: 'Kalenderwochen',
          week: 'KW',
        },
        legend: {
          homework: 'Hausaufgabe',
          exam: 'Prüfung',
          event: 'Event',
        },
        formMessages: {
          invalidDate: 'Bitte gib ein gültiges Datum im Format TT.MM.JJJJ ein.',
          invalidEnd: 'Die Endzeit darf nicht vor der Startzeit liegen.',
          missingSubject: 'Bitte wähle ein Fach aus.',
          missingEventTitle: 'Bitte gib einen Event-Titel ein.',
        },
        modal: {
          viewTitle: 'Kalender-Eintrag',
          noDescription: '<em>Keine Beschreibung vorhanden.</em>',
          close: 'Schließen',
          createTitle: '📝 Neuen Eintrag erstellen',
          labels: {
            type: 'Typ',
            subject: 'Fach',
            eventTitle: 'Event-Titel',
            date: 'Datum',
            dateWithFormat: 'Datum (TT.MM.JJJJ)',
            start: 'Startzeit',
            end: 'Endzeit',
            description: 'Beschreibung',
            descriptionOptional: 'Beschreibung (optional)',
          },
          placeholders: {
            subject: '– bitte wählen –',
            eventTitle: 'Name des Events',
            description: 'Details zum Eintrag',
            descriptionShort: 'Kurzbeschreibung',
            date: '18.09.2025',
          },
          hints: {
            eventTitle: 'Pflichtfeld für Events.',
          },
          buttons: {
            cancel: 'Abbrechen',
            close: 'Schließen',
            save: 'Speichern',
            saveLoading: 'Speichern …',
            delete: 'Löschen',
            deleteLoading: 'Löschen …',
            add: 'Hinzufügen',
            addLoading: 'Hinzufügen …',
          },
          confirmDelete: 'Möchtest du diesen Eintrag wirklich löschen?',
          messages: {
            saveError: 'Fehler beim Speichern.',
            deleteError: 'Fehler beim Löschen.',
            deleteSuccess: 'Eintrag wurde gelöscht.',
            saveSuccess: 'Eintrag wurde erfolgreich gespeichert!',
            saveRetry:
              'Der Eintrag konnte nach mehreren Versuchen nicht gespeichert werden. Bitte versuche es später noch einmal.',
          },
        },
      },
      contact: {
        title: 'Kontakt aufnehmen',
        description: 'Schreibe uns eine Nachricht – wir melden uns so schnell wie möglich.',
        name: 'Name',
        email: 'E-Mail-Adresse',
        subject: 'Betreff',
        message: 'Nachricht',
        attachment: 'Datei anhängen (optional)',
        attachmentHint: 'Max. 2 MB',
        privacy: 'Mit dem Absenden stimme ich der Verarbeitung meiner Angaben zu.',
        submit: 'Nachricht senden',
        cancel: 'Abbrechen',
        success: 'Vielen Dank! Deine Nachricht wurde erfolgreich verschickt.',
        error: 'Nachricht konnte nicht gesendet werden. Bitte versuche es später erneut.',
        errorValidation: 'Bitte überprüfe die markierten Felder.',
        fallbackTitle: 'Alternativ kannst du uns auch per E-Mail erreichen:',
        fallbackCta: 'E-Mail schreiben',
        close: 'Schließen',
      },
    },
    en: {
      common: {
        appName: 'Homework Manager',
        nav: {
          home: '🏠 Dashboard',
          calendar: '📅 Calendar',
          upcoming: '🔔 Upcoming',
          grades: '📊 Grade Calculator',
          currentSubject: '🕒 Current Subject',
          logout: '🚪 Log out',
          primary: 'Main navigation',
          toggle: 'Toggle navigation menu',
          language: 'Change language',
        },
        footer: {
          copyright: '©️ Timo Wigger 2025',
          contact: 'Contact',
          imprint: 'Legal notice',
          privacy: 'Privacy policy',
          changelog: 'Changelog',
          navigation: 'Footer navigation',
        },
        language: {
          menuLabel: 'Select language',
        },
      },
      home: {
        pageTitle: 'Homework Manager',
        heroTitle: 'Homework Manager 2.0',
        description: {
          lead:
            'Homework Manager was built to share homework, exams and projects transparently with the entire class.',
          body:
            'Instead of scattered chats and forgotten notes, the platform unifies schedules, reminders and handy utilities in one clear interface – available at any time and designed for teamwork.',
        },
        release: {
          title: 'Release 2.0',
          date: 'October 2025',
          summary:
            'We are launching Homework Manager 2.0 with a refreshed look and deep technical upgrades. Detailed highlights will follow soon.',
          highlights: {
            design: 'Cohesive dark theme visuals across calendar, subject view and tools.',
            performance: 'Faster APIs for effortless homework syncing.',
            overlays: 'Refined overlays that make editing entries more comfortable.',
          },
          cta: 'Learn more',
        },
      },
      changelog: {
        pageTitle: 'Changelog',
        title: 'Changelog',
        subtitle:
          'Explore the Homework Manager release notes featuring the highlights of version 2.0 and earlier updates.',
        back: '← Back to overview',
        release: {
          title: 'Release 2.0',
          date: 'October 2025',
          summary:
            'Homework Manager 2.0 delivers a fully refreshed experience packed with new capabilities. Here are the headline improvements.',
          items: {
            design:
              'Completely redesigned interface with a cohesive dark theme and refined typography.',
            events: 'Brand-new “Event” feature to capture club meetings, outings, and special occasions.',
            dayView: 'Day overview gathers assignments, exams, and events into one focused stream.',
            account:
              'Foundation for the upcoming account system (work in progress) to enable shared access.',
          },
        },
        archive: {
          title: 'Earlier versions',
          release171: {
            title: 'Release 1.7.1',
            summary:
              'Release 1.7.1 keeps the calendar moving forward and polishes established workflows.',
            items: {
              calendar: 'Admins can now create calendar entries on the spot and edit them immediately.',
              uiFixes: 'Resolved several visual glitches across the interface.',
              formatting: 'Task descriptions now support bold and italic formatting for richer storytelling.',
            },
            patch01: {
              title: 'Patch 0x01',
              items: {
                overlayButton: 'Fixed the close button alignment on calendar overlays.',
                uiTweaks: 'Additional fine-tuning of UI components without changing their behavior.',
              },
            },
            patch02: {
              title: 'Patch 0x02',
              items: {
                scheduleUi: 'Updated the timetable view with refreshed styling.',
              },
            },
          },
        },
      },
      calendar: {
        pageTitle: 'Calendar',
        heading: '📅 Calendar',
        description: 'Keep homework, exams and events in view with a cohesive dark experience.',
        status: {
          loading: 'Loading calendar …',
          error: 'Unable to load calendar entries!',
          unauthorized: 'Please sign in and make sure you are assigned to a class to view the calendar.',
        },
        views: {
          month: 'Month',
          week: 'Week',
          day: 'Day',
        },
        monthNav: {
          label: 'Month navigation',
          previous: 'Previous month',
          next: 'Next month',
          current: 'Current month',
        },
        actions: {
          create: {
            label: 'New entry',
            tooltip: 'Create a new calendar entry',
            disabled: 'Only admins can create entries',
          },
          export: {
            label: 'Export',
            tooltip: 'Export calendar as ICS',
            loading: 'Exporting …',
            success: 'Calendar exported successfully.',
            error: 'Failed to export the calendar.',
            fileName: 'homework-calendar.ics',
            unauthorized: 'Please sign in and make sure you are assigned to a class to export the calendar.',
          },
          back: {
            label: 'Back to overview',
            tooltip: 'Go back to the dashboard',
          },
        },
        actionBar: {
          label: 'Calendar actions',
        },
        weekStrip: {
          label: 'Calendar weeks',
          week: 'W',
        },
        legend: {
          homework: 'Homework',
          exam: 'Exam',
          event: 'Event',
        },
        formMessages: {
          invalidDate: 'Please enter a valid date (DD.MM.YYYY).',
          invalidEnd: 'The end time must not be before the start time.',
          missingSubject: 'Please choose a subject.',
          missingEventTitle: 'Please enter an event title.',
        },
        modal: {
          viewTitle: 'Calendar entry',
          noDescription: '<em>No description provided.</em>',
          close: 'Close',
          createTitle: '📝 Create new entry',
          labels: {
            type: 'Type',
            subject: 'Subject',
            eventTitle: 'Event title',
            date: 'Date',
            dateWithFormat: 'Date (DD.MM.YYYY)',
            start: 'Start time',
            end: 'End time',
            description: 'Description',
            descriptionOptional: 'Description (optional)',
          },
          placeholders: {
            subject: '– select –',
            eventTitle: 'Event name',
            description: 'Entry details',
            descriptionShort: 'Short description',
            date: '09/18/2025',
          },
          hints: {
            eventTitle: 'Required for events.',
          },
          buttons: {
            cancel: 'Cancel',
            close: 'Close',
            save: 'Save',
            saveLoading: 'Saving …',
            delete: 'Delete',
            deleteLoading: 'Deleting …',
            add: 'Add entry',
            addLoading: 'Adding …',
          },
          confirmDelete: 'Do you really want to delete this entry?',
          messages: {
            saveError: 'Unable to save the entry.',
            deleteError: 'Unable to delete the entry.',
            deleteSuccess: 'Entry deleted successfully!',
            saveSuccess: 'Entry saved successfully!',
            saveRetry: 'We could not save the entry after several attempts. Please try again later.',
          },
        },
      },
      contact: {
        title: 'Get in touch',
        description: 'Send us a message and we will get back to you as soon as possible.',
        name: 'Name',
        email: 'Email address',
        subject: 'Subject',
        message: 'Message',
        attachment: 'Attach file (optional)',
        attachmentHint: 'Max. 2 MB',
        privacy: 'By submitting you agree to the processing of your data.',
        submit: 'Send message',
        cancel: 'Cancel',
        success: 'Thank you! Your message has been sent successfully.',
        error: 'We could not send your message. Please try again later.',
        errorValidation: 'Please review the highlighted fields.',
        fallbackTitle: 'You can also reach us via email:',
        fallbackCta: 'Write an email',
        close: 'Close',
      },
    },
    it: {
      common: {
        appName: 'Homework Manager',
        nav: {
          home: '🏠 Home',
          calendar: '📅 Calendario',
          upcoming: '🔔 Eventi in arrivo',
          grades: '📊 Calcolatore di voti',
          currentSubject: '🕒 Materia attuale',
          logout: '🚪 Disconnettersi',
          primary: 'Navigazione principale',
          toggle: 'Apri il menu di navigazione',
          language: 'Cambia lingua',
        },
        footer: {
          copyright: '©️ Timo Wigger 2025',
          contact: 'Contatto',
          imprint: 'Note legali',
          privacy: 'Privacy',
          changelog: 'Changelog',
          navigation: 'Navigazione footer',
        },
        language: {
          menuLabel: 'Seleziona la lingua',
        },
      },
      home: {
        pageTitle: 'Homework Manager',
        heroTitle: 'Homework Manager 2.0',
        description: {
          lead:
            'Homework Manager è nato per condividere compiti, verifiche e progetti in modo trasparente con tutta la classe.',
          body:
            'Al posto di chat disperse e appunti dimenticati, la piattaforma riunisce scadenze, promemoria e strumenti utili in un\'unica interfaccia chiara – sempre disponibile e pensata per il lavoro di squadra.',
        },
        release: {
          title: 'Release 2.0',
          date: 'Ottobre 2025',
          summary:
            'Lanciamo Homework Manager 2.0 con un aspetto rinnovato e numerosi miglioramenti tecnici. I dettagli arriveranno a breve.',
          highlights: {
            design: 'Nuovo design dark theme per calendario, panoramica materie e strumenti.',
            performance: 'API più rapide per sincronizzare i compiti senza attese.',
            overlays: 'Overlay migliorati per modificare le voci con maggiore comodità.',
          },
          cta: 'Scopri di più',
        },
      },
      changelog: {
        pageTitle: 'Changelog',
        title: 'Changelog',
        subtitle:
          'Consulta le note di rilascio di Homework Manager con i punti salienti della versione 2.0 e degli aggiornamenti precedenti.',
        back: '← Torna alla panoramica',
        release: {
          title: 'Release 2.0',
          date: 'Ottobre 2025',
          summary:
            'Homework Manager 2.0 offre un’esperienza completamente rinnovata ricca di novità. Ecco i miglioramenti principali.',
          items: {
            design:
              'Interfaccia riprogettata da cima a fondo con un tema scuro coerente e tipografia curata.',
            events: 'Nuova funzione «Eventi» per pianificare uscite, club e appuntamenti speciali.',
            dayView:
              'La panoramica giornaliera riunisce compiti, verifiche ed eventi in un unico flusso concentrato.',
            account:
              'Posa le basi per il futuro sistema di account (work in progress) e la collaborazione condivisa.',
          },
        },
        archive: {
          title: 'Versioni precedenti',
          release171: {
            title: 'Release 1.7.1',
            summary:
              'La release 1.7.1 dà nuova energia al calendario e rifinisce l’interfaccia esistente.',
            items: {
              calendar:
                'Gli admin possono ora creare voci direttamente nel calendario e modificarle all’istante.',
              uiFixes: 'Corrette diverse anomalie di visualizzazione nell’interfaccia.',
              formatting:
                'Le descrizioni delle attività supportano ora grassetto e corsivo per evidenziare meglio le informazioni.',
            },
            patch01: {
              title: 'Patch 0x01',
              items: {
                overlayButton: 'Risolto l’allineamento del pulsante di chiusura nelle finestre del calendario.',
                uiTweaks: 'Ulteriori piccoli ritocchi ai componenti dell’interfaccia senza alterarne le funzioni.',
              },
            },
            patch02: {
              title: 'Patch 0x02',
              items: {
                scheduleUi: 'Interfaccia dell’orario aggiornata graficamente.',
              },
            },
          },
        },
      },
      calendar: {
        pageTitle: 'Calendario',
        heading: '📅 Calendario',
        description: 'Gestisci compiti, verifiche ed eventi in un\'interfaccia scura e coerente.',
        status: {
          loading: 'Caricamento del calendario …',
          error: 'Impossibile caricare le voci del calendario!',
          unauthorized: 'Accedi e assicurati di essere assegnato a una classe per visualizzare il calendario.',
        },
        views: {
          month: 'Mese',
          week: 'Settimana',
          day: 'Giorno',
        },
        monthNav: {
          label: 'Navigazione mesi',
          previous: 'Mese precedente',
          next: 'Mese successivo',
          current: 'Mese corrente',
        },
        actions: {
          create: {
            label: 'Nuova voce',
            tooltip: 'Crea una nuova voce di calendario',
            disabled: 'Solo gli admin possono creare voci',
          },
          export: {
            label: 'Esporta',
            tooltip: 'Esporta il calendario come ICS',
            loading: 'Esportazione …',
            success: 'Calendario esportato con successo.',
            error: 'Errore durante l\'esportazione del calendario.',
            fileName: 'homework-calendar.ics',
            unauthorized: 'Accedi e assicurati di essere assegnato a una classe per esportare il calendario.',
          },
          back: {
            label: 'Panoramica',
            tooltip: 'Torna alla pagina iniziale',
          },
        },
        actionBar: {
          label: 'Azioni del calendario',
        },
        weekStrip: {
          label: 'Settimane',
          week: 'Sett.',
        },
        legend: {
          homework: 'Compito',
          exam: 'Verifica',
          event: 'Evento',
        },
        formMessages: {
          invalidDate: 'Inserisci una data valida nel formato GG.MM.AAAA.',
          invalidEnd: 'L\'orario di fine non può precedere l\'orario di inizio.',
          missingSubject: 'Seleziona una materia.',
          missingEventTitle: 'Inserisci un titolo per l\'evento.',
        },
        modal: {
          viewTitle: 'Voce di calendario',
          noDescription: '<em>Nessuna descrizione disponibile.</em>',
          close: 'Chiudi',
          createTitle: '📝 Crea una nuova voce',
          labels: {
            type: 'Tipo',
            subject: 'Materia',
            eventTitle: 'Titolo evento',
            date: 'Data',
            dateWithFormat: 'Data (GG.MM.AAAA)',
            start: 'Ora di inizio',
            end: 'Ora di fine',
            description: 'Descrizione',
            descriptionOptional: 'Descrizione (facoltativa)',
          },
          placeholders: {
            subject: '– seleziona –',
            eventTitle: 'Nome dell\'evento',
            description: 'Dettagli della voce',
            descriptionShort: 'Breve descrizione',
            date: '18.09.2025',
          },
          hints: {
            eventTitle: 'Campo obbligatorio per gli eventi.',
          },
          buttons: {
            cancel: 'Annulla',
            close: 'Chiudi',
            save: 'Salva',
            saveLoading: 'Salvataggio …',
            delete: 'Elimina',
            deleteLoading: 'Eliminazione …',
            add: 'Aggiungi',
            addLoading: 'Aggiunta …',
          },
          confirmDelete: 'Vuoi davvero eliminare questa voce?',
          messages: {
            saveError: 'Impossibile salvare la voce.',
            deleteError: 'Impossibile eliminare la voce.',
            deleteSuccess: 'Voce eliminata con successo.',
            saveSuccess: 'Voce salvata con successo!',
            saveRetry: 'Non è stato possibile salvare la voce dopo vari tentativi. Riprova più tardi.',
          },
        },
      },
      contact: {
        title: 'Contattaci',
        description: 'Scrivici e ti risponderemo il prima possibile.',
        name: 'Nome',
        email: 'Indirizzo e-mail',
        subject: 'Oggetto',
        message: 'Messaggio',
        attachment: 'Allega file (opzionale)',
        attachmentHint: 'Max 2 MB',
        privacy: 'Inviando accetti il trattamento dei tuoi dati.',
        submit: 'Invia messaggio',
        cancel: 'Annulla',
        success: 'Grazie! Il tuo messaggio è stato inviato con successo.',
        error: 'Impossibile inviare il messaggio. Riprova più tardi.',
        errorValidation: 'Controlla i campi evidenziati.',
        fallbackTitle: 'Puoi anche scriverci via email:',
        fallbackCta: 'Scrivi un’email',
        close: 'Chiudi',
      },
    },
    fr: {
      common: {
        appName: 'Homework Manager',
        nav: {
          home: '🏠 Tableau de bord',
          calendar: '📅 Calendrier',
          upcoming: '🔔 À venir',
          grades: '📊 Calculateur de notes',
          currentSubject: '🕒 Matière actuelle',
          logout: '🚪 Déconnexion',
          primary: 'Navigation principale',
          toggle: 'Basculer le menu de navigation',
          language: 'Changer de langue',
        },
        footer: {
          copyright: '©️ Timo Wigger 2025',
          contact: 'Contact',
          imprint: 'Mentions légales',
          privacy: 'Protection des données',
          changelog: 'Journal des modifications',
          navigation: 'Navigation du pied de page',
        },
        language: {
          menuLabel: 'Sélectionner la langue',
        },
      },
      home: {
        pageTitle: 'Homework Manager',
        heroTitle: 'Homework Manager 2.0',
        description: {
          lead:
            'Homework Manager a été créé pour partager les devoirs, évaluations et projets en toute transparence avec toute la classe.',
          body:
            'Plutôt que des discussions dispersées et des notes oubliées, la plateforme rassemble horaires, rappels et outils pratiques dans une interface claire – disponible à tout moment et pensée pour le travail en équipe.',
        },
        release: {
          title: 'Version 2.0',
          date: 'Octobre 2025',
          summary:
            'Nous lançons Homework Manager 2.0 avec une apparence renouvelée et de profondes améliorations techniques. Les points forts détaillés suivront bientôt.',
          highlights: {
            design: 'Habillage sombre harmonisé pour le calendrier, la vue des matières et les outils.',
            performance: 'Des API plus rapides pour synchroniser les devoirs sans effort.',
            overlays: 'Des fenêtres modales retravaillées pour modifier les entrées plus confortablement.',
          },
          cta: 'En savoir plus',
        },
      },
      changelog: {
        pageTitle: 'Journal des modifications',
        title: 'Journal des modifications',
        subtitle:
          'Découvrez les notes de version de Homework Manager – avec les temps forts de la version 2.0 et des mises à jour précédentes.',
        back: '← Retour à l’aperçu',
        release: {
          title: 'Version 2.0',
          date: 'Octobre 2025',
          summary:
            'Homework Manager 2.0 propose une expérience entièrement repensée et riche en nouveautés. Voici les éléments clés du lancement.',
          items: {
            design:
              'Interface entièrement réinventée avec un thème sombre cohérent et une typographie soignée.',
            events: 'Nouveau module « Événement » pour planifier sorties, clubs et rendez-vous spéciaux.',
            dayView: 'Vue quotidienne regroupant devoirs, examens et événements dans un flux focalisé.',
            account:
              'Fondations posées pour le futur système de comptes (travail en cours) afin de faciliter l’usage partagé.',
          },
        },
        archive: {
          title: 'Versions précédentes',
          release171: {
            title: 'Version 1.7.1',
            summary:
              'La version 1.7.1 dynamise le calendrier et apporte un polissage bienvenu à l’interface.',
            items: {
              calendar:
                'Les admins peuvent désormais créer des entrées directement dans le calendrier et les modifier aussitôt.',
              uiFixes: 'Plusieurs problèmes d’affichage ont été corrigés.',
              formatting:
                'Les descriptions de tâches prennent en charge le gras et l’italique pour mieux mettre en avant les informations.',
            },
            patch01: {
              title: 'Patch 0x01',
              items: {
                overlayButton: 'Correction de l’affichage du bouton de fermeture dans les fenêtres du calendrier.',
                uiTweaks: 'Autres ajustements visuels mineurs sans impact sur les fonctionnalités.',
              },
            },
            patch02: {
              title: 'Patch 0x02',
              items: {
                scheduleUi: 'Interface de l’emploi du temps rafraîchie.',
              },
            },
          },
        },
      },
      calendar: {
        pageTitle: 'Calendrier',
        heading: '📅 Calendrier',
        description: 'Gardez devoirs, évaluations et événements en vue grâce à une interface sombre harmonisée.',
        status: {
          loading: 'Chargement du calendrier …',
          error: 'Impossible de charger les entrées du calendrier !',
          unauthorized: 'Connecte-toi et assure-toi d’être affecté·e à une classe pour afficher le calendrier.',
        },
        views: {
          month: 'Mois',
          week: 'Semaine',
          day: 'Jour',
        },
        monthNav: {
          label: 'Navigation par mois',
          previous: 'Mois précédent',
          next: 'Mois suivant',
          current: 'Mois en cours',
        },
        actions: {
          create: {
            label: 'Nouvelle entrée',
            tooltip: 'Créer une nouvelle entrée de calendrier',
            disabled: 'Seuls les administrateurs peuvent créer des entrées',
          },
          export: {
            label: 'Exporter',
            tooltip: 'Exporter le calendrier au format ICS',
            loading: 'Export en cours…',
            success: 'Calendrier exporté avec succès.',
            error: 'Échec de l’export du calendrier.',
            fileName: 'homework-calendar.ics',
            unauthorized: 'Connecte-toi et assure-toi d’être affecté·e à une classe pour exporter le calendrier.',
          },
          back: {
            label: 'Retour à l’aperçu',
            tooltip: 'Revenir au tableau de bord',
          },
        },
        actionBar: {
          label: 'Actions du calendrier',
        },
        weekStrip: {
          label: 'Semaines du calendrier',
          week: 'Sem',
        },
        legend: {
          homework: 'Devoir',
          exam: 'Évaluation',
          event: 'Événement',
        },
        formMessages: {
          invalidDate: 'Veuillez saisir une date valide au format JJ.MM.AAAA.',
          invalidEnd: 'L’heure de fin ne peut pas être antérieure à l’heure de début.',
          missingSubject: 'Veuillez choisir une matière.',
          missingEventTitle: 'Veuillez saisir un titre d’événement.',
        },
        modal: {
          viewTitle: 'Entrée du calendrier',
          noDescription: '<em>Aucune description disponible.</em>',
          close: 'Fermer',
          createTitle: '📝 Créer une nouvelle entrée',
          labels: {
            type: 'Type',
            subject: 'Matière',
            eventTitle: 'Titre de l’événement',
            date: 'Date',
            dateWithFormat: 'Date (JJ.MM.AAAA)',
            start: 'Heure de début',
            end: 'Heure de fin',
            description: 'Description',
            descriptionOptional: 'Description (facultatif)',
          },
          placeholders: {
            subject: '– sélectionner –',
            eventTitle: 'Nom de l’événement',
            description: 'Détails de l’entrée',
            descriptionShort: 'Résumé',
            date: '18.09.2025',
          },
          hints: {
            eventTitle: 'Champ obligatoire pour les événements.',
          },
          buttons: {
            cancel: 'Annuler',
            close: 'Fermer',
            save: 'Enregistrer',
            saveLoading: 'Enregistrement…',
            delete: 'Supprimer',
            deleteLoading: 'Suppression…',
            add: 'Ajouter',
            addLoading: 'Ajout en cours…',
          },
          confirmDelete: 'Voulez-vous vraiment supprimer cette entrée ?',
          messages: {
            saveError: 'Impossible d’enregistrer l’entrée.',
            deleteError: 'Impossible de supprimer l’entrée.',
            deleteSuccess: 'Entrée supprimée avec succès.',
            saveSuccess: 'Entrée enregistrée avec succès !',
            saveRetry: 'Impossible d’enregistrer l’entrée après plusieurs tentatives. Veuillez réessayer plus tard.',
          },
        },
      },
      contact: {
        title: 'Nous contacter',
        description: 'Envoyez-nous un message et nous vous répondrons rapidement.',
        name: 'Nom',
        email: 'Adresse e-mail',
        subject: 'Objet',
        message: 'Message',
        attachment: 'Joindre un fichier (optionnel)',
        attachmentHint: 'Max. 2 Mo',
        privacy: 'En envoyant ce formulaire, vous acceptez le traitement de vos données.',
        submit: 'Envoyer le message',
        cancel: 'Annuler',
        success: 'Merci ! Votre message a bien été envoyé.',
        error: 'Impossible d’envoyer votre message. Veuillez réessayer plus tard.',
        errorValidation: 'Veuillez vérifier les champs mis en évidence.',
        fallbackTitle: 'Vous pouvez également nous écrire par e-mail :',
        fallbackCta: 'Envoyer un e-mail',
        close: 'Fermer',
      },
    },

  };

  const FALLBACK_LOCALE = 'de';
  let currentLocale = null;

  function normaliseLocale(locale) {
    if (!locale) return null;
    const lower = locale.toLowerCase();
    if (translations[lower]) return lower;
    const short = lower.split('-')[0];
    return translations[short] ? short : null;
  }

  function detectLocale() {
    return (
      normaliseLocale(document.documentElement.getAttribute('lang')) ||
      normaliseLocale(navigator.language) ||
      FALLBACK_LOCALE
    );
  }

  function getFromLocale(locale, pathParts) {
    return pathParts.reduce((acc, key) => {
      if (acc && Object.prototype.hasOwnProperty.call(acc, key)) {
        return acc[key];
      }
      return undefined;
    }, translations[locale]);
  }

  function get(path, fallback) {
    if (!path) return fallback;
    const parts = path.split('.');
    const primary = getFromLocale(currentLocale, parts);
    if (primary !== undefined) {
      return primary;
    }
    if (currentLocale !== FALLBACK_LOCALE) {
      const fallbackValue = getFromLocale(FALLBACK_LOCALE, parts);
      if (fallbackValue !== undefined) {
        return fallbackValue;
      }
    }
    return fallback;
  }

  function apply(root = document) {
    const scope = root instanceof Element || root instanceof DocumentFragment ? root : document;
    scope.querySelectorAll('[data-i18n]').forEach((element) => {
      const key = element.getAttribute('data-i18n');
      if (!key) return;
      const value = get(key);
      if (value !== undefined && value !== null) {
        if (element.hasAttribute('data-i18n-html')) {
          element.innerHTML = value;
        } else {
          element.textContent = value;
        }
      }
    });

    scope.querySelectorAll('[data-i18n-attr]').forEach((element) => {
      const map = element.getAttribute('data-i18n-attr');
      if (!map) return;
      map.split(',').forEach((pair) => {
        const [attr, key] = pair.split(':').map((item) => item && item.trim());
        if (!attr || !key) return;
        const value = get(key);
        if (value !== undefined && value !== null) {
          element.setAttribute(attr, value);
        }
      });
    });
  }

  function setLocale(nextLocale) {
    const normalised = normaliseLocale(nextLocale) || FALLBACK_LOCALE;
    if (normalised === currentLocale) {
      return;
    }
    currentLocale = normalised;
    document.documentElement.setAttribute('lang', currentLocale);
    document.documentElement.setAttribute('data-locale', currentLocale);
    apply();
  }

  function getLocale() {
    return currentLocale;
  }

  function scope(prefix) {
    return (key, fallback) => get(prefix ? `${prefix}.${key}` : key, fallback);
  }

  currentLocale = detectLocale();
  document.documentElement.setAttribute('data-locale', currentLocale);

  global.hmI18n = {
    get,
    apply,
    setLocale,
    getLocale,
    scope,
    translations,
  };

  if (document.readyState !== 'loading') {
    apply();
  } else {
    document.addEventListener('DOMContentLoaded', () => apply());
  }
})(window);
