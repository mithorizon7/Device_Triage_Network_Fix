import { Component, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

function RecoveryMessage() {
  const { t } = useTranslation();
  return (
    <main className="min-h-screen grid place-items-center p-6">
      <section role="alert" className="max-w-md space-y-4 rounded-2xl border bg-card p-6">
        <h1 className="text-xl font-display">{t("errors.unexpectedTitle")}</h1>
        <p className="text-muted-foreground">{t("errors.unexpectedDescription")}</p>
        <Button onClick={() => window.location.reload()}>{t("errors.reload")}</Button>
      </section>
    </main>
  );
}

export class AppRecoveryBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? <RecoveryMessage /> : this.props.children;
  }
}
