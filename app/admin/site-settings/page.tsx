import { SiteSettings } from "@/app/admin-components/site-settings"

export default function SiteSettingsPage() {
  return (
    <div className="container mx-auto p-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Website Instellingen</h1>
      <SiteSettings />
    </div>
  )
}

