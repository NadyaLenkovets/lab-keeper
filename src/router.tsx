import { Navigate, createBrowserRouter } from 'react-router-dom'
import { PageLayout } from '@/components/layout/page-layout'
import { ArticlePage } from '@/pages/article-page'
import { AskPage } from '@/pages/ask-page'
import { CreatePage } from '@/pages/create-page'
import { GeneratingPage } from '@/pages/generating-page'
import { JourneyRunPage } from '@/pages/journey-run-page'
import { MainPage } from '@/pages/main-page'
import { ProfilePage } from '@/pages/profile-page'
import { ReportPage } from '@/pages/report-page'
import { TestRunPage } from '@/pages/test-run-page'
import { TestsPage } from '@/pages/tests-page'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PageLayout />,
    children: [
      { index: true, element: <Navigate to="/main" replace /> },
      { path: 'main', element: <MainPage /> },
      { path: 'home', element: <Navigate to="/main" replace /> },
      { path: 'article/:slug', element: <ArticlePage /> },
      { path: 'tests', element: <TestsPage /> },
      { path: 'tests/:slug', element: <TestRunPage /> },
      { path: 'create', element: <CreatePage /> },
      { path: 'generating', element: <GeneratingPage /> },
      { path: 'journey/:id', element: <JourneyRunPage /> },
      { path: 'journey/:id/report', element: <ReportPage /> },
      { path: 'ask', element: <AskPage /> },
      { path: 'profile', element: <ProfilePage /> },
    ],
  },
])
