import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { NotFoundPage } from '../pages/NotFoundPage';
import { AppLayout } from '../components/AppLayout';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { AboutPage } from '../pages/AboutPage';
import { CalendarPage } from '../pages/CalendarPage';
import { ChangelogPage } from '../pages/ChangelogPage';
import { CurrentSubjectPage } from '../pages/CurrentSubjectPage';
import { DeparturesPage } from '../pages/DeparturesPage';
import { DayOverviewPage } from '../pages/DayOverviewPage';
import { GradeCalculatorPage } from '../pages/GradeCalculatorPage';
import { HelpPage } from '../pages/HelpPage';
import { HistoryPage } from '../pages/HistoryPage';
import { HomePage } from '../pages/HomePage';
import { LegalPage } from '../pages/LegalPage';
import { LoginPage } from '../pages/LoginPage';
import { ProfilePage } from '../pages/ProfilePage';
import { TodoListsPage } from '../pages/TodoListsPage';
import { TimetableWeekPage } from '../pages/TimetableWeekPage';
import { UpcomingPage } from '../pages/UpcomingPage';
import { WeeklyPreviewPage } from '../pages/WeeklyPreviewPage';

const ROUTES = [
  {
    title: 'Homework Manager',
    element: <HomePage />,
    paths: ['/', '/index.html'],
  },
  {
    title: 'Mehr über HWM - Homework Manager',
    element: <AboutPage />,
    paths: ['/mehr-ueber-hwm', '/about', '/about.html', '/mehr-ueber-hwm.html'],
  },
  {
    title: 'Geschichte von HWM - Homework Manager',
    element: <HistoryPage />,
    paths: ['/geschichte', '/geschichte.html'],
  },
  {
    title: 'Hilfe - Homework Manager',
    element: <HelpPage />,
    paths: ['/help', '/help.html'],
  },
  {
    title: 'Changelog - Homework Manager',
    element: <ChangelogPage />,
    paths: ['/changelog', '/changelog.html'],
  },
  {
    title: 'Datenschutz - Homework Manager',
    element: <LegalPage pageKey="privacy.main" />,
    paths: ['/datenschutz', '/datenschutz.html'],
  },
  {
    title: 'Impressum - Homework Manager',
    element: <LegalPage pageKey="imprint.main" />,
    paths: ['/impressum', '/impressum.html'],
  },
  {
    title: 'Login - Homework Manager',
    element: <LoginPage />,
    paths: ['/login', '/login.html'],
  },
  {
    title: 'Kalender - Homework Manager',
    element: <CalendarPage />,
    paths: ['/kalender', '/kalender.html'],
  },
  {
    title: 'Abfahrten - Homework Manager',
    element: <DeparturesPage />,
    paths: ['/abfahrten', '/abfahrten/'],
  },
  {
    title: 'Anstehend - Homework Manager',
    element: <UpcomingPage />,
    paths: ['/upcoming', '/upcoming.html'],
  },
  {
    title: "ToDo's - Homework Manager",
    element: <TodoListsPage />,
    paths: ['/todos', '/todos.html'],
  },
  {
    title: 'Daybrief - Homework Manager',
    element: <WeeklyPreviewPage />,
    paths: ['/weekly-preview', '/weekly-preview.html'],
  },
  {
    title: 'Aktuelles Fach - Homework Manager',
    element: <CurrentSubjectPage />,
    paths: ['/stundenplan', '/stundenplan.html'],
  },
  {
    title: 'Tagesvorschau - Homework Manager',
    element: <DayOverviewPage />,
    paths: ['/tagesuebersicht', '/tagesuebersicht.html'],
  },
  {
    title: 'Wochenvorschau - Homework Manager',
    element: <TimetableWeekPage />,
    paths: ['/timetable-week', '/timetable-week.html'],
  },
  {
    title: 'Notenrechner - Homework Manager',
    element: <GradeCalculatorPage />,
    paths: ['/notenrechner', '/notenrechner.html'],
  },
  {
    title: 'Profil - Homework Manager',
    element: <ProfilePage />,
    paths: ['/profile', '/profile.html'],
  },
  {
    title: 'Adminbereich - Homework Manager',
    element: <AdminDashboardPage />,
    paths: ['/admin/dashboard', '/admin/dashboard.html'],
  },
];

function PageRoute({ title, element }) {
  useEffect(() => {
    if (title) {
      document.title = title;
    }
  }, [title]);

  return element;
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          {ROUTES.flatMap((routeConfig) =>
            routeConfig.paths.map((path) => (
              <Route
                key={path}
                path={path}
                element={<PageRoute title={routeConfig.title} element={routeConfig.element} />}
              />
            ))
          )}
          <Route path="*" element={<PageRoute title="Seite nicht gefunden – Homework Manager" element={<NotFoundPage />} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
