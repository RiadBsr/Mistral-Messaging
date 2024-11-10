import { LucideProps, UserPlus } from "lucide-react";

export const Icons = {
  Logo: (props: LucideProps) => (
    <svg {...props} viewBox="0 -0.5 22 22" shapeRendering="crispEdges">
      <path
        stroke="#0c1d35"
        d="M2 0h18M1 1h2M19 1h2M1 2h1M20 2h1M0 3h1M21 3h1M0 4h1M21 4h1M0 5h1M21 5h1M0 6h1M5 6h2M10 6h2M15 6h2M21 6h1M0 7h1M5 7h2M10 7h2M15 7h2M21 7h1M0 8h1M21 8h1M0 9h1M21 9h1M0 10h1M21 10h1M0 11h1M21 11h1M0 12h1M21 12h1M0 13h2M20 13h2M1 14h2M19 14h2M2 15h2M18 15h2M3 16h1M7 16h12M3 17h1M6 17h2M3 18h1M5 18h2M3 19h3M3 20h2M3 21h1"
      />
      <path stroke="#ffffff" d="M3 1h15M2 2h2M1 3h2M1 4h1" />
      <path stroke="#f88201" d="M18 1h1M19 2h1" />
      <path stroke="#f9df31" d="M4 2h14M3 3h1M2 4h1M1 5h1M1 6h1M1 7h1" />
      <path stroke="#faa800" d="M18 2h1M18 3h2M19 4h1" />
      <path stroke="#f6f9b1" d="M4 3h14M3 4h1" />
      <path stroke="#e0300c" d="M20 3h1M20 4h1M20 5h1M20 6h1M20 7h1M20 8h1" />
      <path stroke="#f7f280" d="M4 4h15" />
      <path stroke="#f9e339" d="M2 5h18" />
      <path stroke="#f8d005" d="M2 6h3M7 6h3M12 6h3M17 6h3" />
      <path stroke="#f9be05" d="M2 7h3M7 7h3M12 7h3M17 7h3" />
      <path stroke="#f29e04" d="M1 8h1M2 9h18" />
      <path stroke="#f5bb08" d="M2 8h18" />
      <path stroke="#f66617" d="M1 9h1M2 10h18" />
      <path stroke="#c2082d" d="M20 9h1" />
      <path stroke="#fc2e2b" d="M1 10h1M2 11h17" />
      <path stroke="#b1022d" d="M20 10h1" />
      <path stroke="#f2032d" d="M1 11h1M2 12h17M4 13h14M4 15h1M5 16h1M4 17h1" />
      <path stroke="#fc2d2f" d="M19 11h1" />
      <path
        stroke="#bb0434"
        d="M20 11h1M19 12h2M2 13h2M18 13h2M3 14h16M5 15h1"
      />
      <path stroke="#950030" d="M1 12h1" />
      <path stroke="#62052d" d="M6 15h12M6 16h1M5 17h1M4 18h1" />
      <path stroke="#f8f289" d="M4 16h1" />
    </svg>
  ),
  UserPlus,
};

export type Icon = keyof typeof Icons;
