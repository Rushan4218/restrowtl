import { SettingsContent } from "@/components/admin/settings-content";

export default function SettingsPage() {
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-foreground">
        Settings
      </h1>
      <SettingsContent />
    </div>
  );
}
