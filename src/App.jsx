import { Navigate, Route, Routes } from "react-router-dom";
import { useApp } from "./lib/useApp.jsx";
import LoginPage from "./components/LoginPage.jsx";
import Shell from "./components/Shell.jsx";
import TodayPage from "./pages/TodayPage.jsx";
import GymPage from "./pages/GymPage.jsx";
import FoodPage from "./pages/FoodPage.jsx";
import CookbookPage from "./pages/CookbookPage.jsx";
import GroceryPage from "./pages/GroceryPage.jsx";
import CalendarPage from "./pages/CalendarPage.jsx";

export default function App() {
  const { auth } = useApp();

  if (auth.loading) {
    return (
      <div className="boot">
        <p>Hang on dumbass</p>
      </div>
    );
  }

  if (!auth.ok) {
    return <LoginPage />;
  }

  return (
    <Routes>
      <Route element={<Shell />}>
        <Route path="/" element={<TodayPage />} />
        <Route path="/gym" element={<GymPage />} />
        <Route path="/food" element={<FoodPage />} />
        <Route path="/cookbook" element={<CookbookPage />} />
        <Route path="/grocery" element={<GroceryPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
