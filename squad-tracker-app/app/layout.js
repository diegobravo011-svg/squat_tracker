import { DM_Sans, Space_Mono, Space_Grotesk } from "next/font/google";

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600"] });
const spaceMono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-space-mono" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-space-grotesk" });

export const metadata = {
  title: "Squad Tracker",
  description: "Seguimiento colaborativo de tareas para tu equipo — powered by Supabase",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${dmSans.className} ${spaceMono.variable} ${spaceGrotesk.variable}`}>
        {children}
      </body>
    </html>
  );
}
