import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center app-shell">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-[hsl(var(--destructive))]" />
            <h1 className="text-2xl font-bold font-display tracking-[0.16em] uppercase">
              {t("notFound.title")}
            </h1>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">{t("notFound.description")}</p>
        </CardContent>
      </Card>
    </div>
  );
}
