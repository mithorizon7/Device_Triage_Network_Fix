import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initializeI18n } from "./lib/i18n";
import { AppRecoveryBoundary } from "./components/AppRecoveryBoundary";

async function bootstrap() {
  try {
    await initializeI18n();
  } catch (error) {
    console.error("Failed to initialize i18n resources", error);
  }

  createRoot(document.getElementById("root")!).render(
    <AppRecoveryBoundary>
      <App />
    </AppRecoveryBoundary>
  );
}

void bootstrap();
