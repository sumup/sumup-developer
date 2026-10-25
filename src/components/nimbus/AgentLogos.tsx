import type { IconProps } from "@sumup-oss/icons";
import claude from "../../assets/agents/claude.svg?url";
import codex from "../../assets/agents/codex.svg?url";
import cursor from "../../assets/agents/cursor.svg?url";

const logos = [claude, codex, cursor];

// Circuit's icon slot keeps the label as text while allowing a group of marks.
export default function AgentLogos({ className }: IconProps) {
  return (
    <span
      className={`${className ?? ""} agent-logos`}
      aria-hidden="true"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--cui-spacings-bit)",
        width: "auto",
        height: "1.25rem",
      }}
    >
      {logos.map((logo) => (
        <span
          key={logo}
          className="agent-logo"
          style={{
            width: "1.25rem",
            height: "1.25rem",
            background: "currentColor",
            mask: `url(${JSON.stringify(logo)}) center / contain no-repeat`,
          }}
        />
      ))}
    </span>
  );
}
