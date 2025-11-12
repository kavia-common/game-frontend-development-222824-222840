import React from "react";

/**
 * PUBLIC_INTERFACE
 * Button - Themed button used across the app.
 *
 * Props:
 * - variant: "default" | "primary" | "secondary"
 * - size: "sm" | "md" | "lg"
 * - onClick: function
 * - disabled: boolean
 * - children: ReactNode
 */
export default function Button({
  variant = "default",
  size = "md",
  onClick,
  disabled = false,
  children,
  type = "button",
  ariaLabel
}) {
  const className = [
    "btn",
    variant === "primary" ? "primary" : "",
    variant === "secondary" ? "secondary" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const sizeStyle =
    size === "sm"
      ? { padding: "8px 12px", fontSize: 13 }
      : size === "lg"
      ? { padding: "12px 18px", fontSize: 16 }
      : { padding: "10px 14px", fontSize: 14 };

  return (
    <button
      type={type}
      className={className}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      style={sizeStyle}
    >
      {children}
    </button>
  );
}
