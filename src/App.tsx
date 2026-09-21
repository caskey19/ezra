import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom"
import { CalendarPage } from "./app/calendar.tsx"
import { ComingOnline } from "./app/ComingOnline.tsx"
import { Dashboard } from "./app/dashboard.tsx"
import { MailPage } from "./app/mail.tsx"
import { Shell } from "./app/shell.tsx"

const router = createBrowserRouter([
  {
    path: "/",
    element: <Shell />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "calendar", element: <CalendarPage /> },
      { path: "mail", element: <MailPage /> },
      { path: "academic", element: <ComingOnline key="academic" moduleName="Academic" /> },
      { path: "athletic", element: <ComingOnline key="athletic" moduleName="Athletic" /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
