import { BellIcon, MonitorIcon, PaletteIcon, UserCogIcon, WrenchIcon } from "lucide-react"
import {
  Settings,
  SettingsBody,
  SettingsContent,
  SettingsDescription,
  SettingsHeader,
  SettingsNav,
  SettingsNavIcon,
  SettingsNavLink,
  SettingsNavList,
  SettingsNavSelect,
  SettingsSection,
  SettingsSectionBody,
  SettingsSectionContent,
  SettingsSectionDescription,
  SettingsSectionHeader,
  SettingsSectionSeparator,
  SettingsSectionTitle,
  SettingsSeparator,
  SettingsTitle,
} from "./settings-layout"
import { AccountForm } from "./account-form"
import { AppearanceForm } from "./appearance-form"
import { DisplayForm } from "./display-form"
import { NotificationsForm } from "./notifications-form"
import { ProfileForm } from "./profile-form"

const sections = [
  {
    href: "/settings",
    title: "Profile",
    icon: <UserCogIcon />,
    desc: "This is how others will see you on the site.",
    form: ProfileForm,
  },
  {
    href: "/settings/account",
    title: "Account",
    icon: <WrenchIcon />,
    desc: "Update your account settings. Set your preferred language and timezone.",
    form: AccountForm,
  },
  {
    href: "/settings/appearance",
    title: "Appearance",
    icon: <PaletteIcon />,
    desc: "Customize the appearance of the app. Automatically switch between day and night themes.",
    form: AppearanceForm,
  },
  {
    href: "/settings/notifications",
    title: "Notifications",
    icon: <BellIcon />,
    desc: "Configure how you receive notifications.",
    form: NotificationsForm,
  },
  {
    href: "/settings/display",
    title: "Display",
    icon: <MonitorIcon />,
    desc: "Turn items on or off to control what's displayed in the app.",
    form: DisplayForm,
  },
]

/** Demo settings pages. */
export function SettingsPage({ path, navigate }: { path: string; navigate: (to: string) => void }) {
  const section = sections.find((s) => s.href === path) ?? sections[0]
  const Form = section.form
  return (
    <Settings value={section.href} onValueChange={navigate}>
      <SettingsHeader>
        <SettingsTitle>Settings</SettingsTitle>
        <SettingsDescription>Manage your account settings and set e-mail preferences.</SettingsDescription>
      </SettingsHeader>
      <SettingsSeparator />
      <SettingsBody>
        <SettingsNav>
          <SettingsNavSelect options={sections.map((s) => ({ value: s.href, label: s.title, icon: s.icon }))} />
          <SettingsNavList>
            {sections.map((s) => (
              <SettingsNavLink key={s.href} value={s.href}>
                <a href={`#${s.href}`}>
                  <SettingsNavIcon>{s.icon}</SettingsNavIcon>
                  {s.title}
                </a>
              </SettingsNavLink>
            ))}
          </SettingsNavList>
        </SettingsNav>
        <SettingsContent>
          <SettingsSection key={section.href}>
            <SettingsSectionHeader>
              <SettingsSectionTitle>{section.title}</SettingsSectionTitle>
              <SettingsSectionDescription>{section.desc}</SettingsSectionDescription>
            </SettingsSectionHeader>
            <SettingsSectionSeparator />
            <SettingsSectionBody>
              <SettingsSectionContent>
                <Form />
              </SettingsSectionContent>
            </SettingsSectionBody>
          </SettingsSection>
        </SettingsContent>
      </SettingsBody>
    </Settings>
  )
}
