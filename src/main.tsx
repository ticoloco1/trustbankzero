import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n/index.ts"; // inicializa i18n antes de tudo

createRoot(document.getElementById("root")!).render(<App />);
