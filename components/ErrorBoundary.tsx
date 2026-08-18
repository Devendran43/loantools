"use client";

import { Component, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Last-resort safety net around the calculator.
 *
 * If an unexpected exception occurs during render (a malformed input that
 * slips past validation, a browser quirk, etc.), this stops the entire page
 * from going blank and instead shows a neutral, honest message — never a
 * partially-computed financial figure. No error details (which could include
 * the user's loan inputs) are logged anywhere; they stay on the user's
 * device, consistent with the app's privacy-first principle.
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  // Intentionally an empty override, with no `error`/`info` parameters:
  // logging them could expose the user's financial inputs via component
  // props, and this app sends nothing off-device.
  componentDidCatch(): void {}

  render() {
    if (this.state.hasError) {
      return (
        <div className="container">
          <div className="emptyState" role="alert">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-danger)"
              strokeWidth="2"
              style={{ flexShrink: 0 }}
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v5M12 16h.01" strokeLinecap="round" />
            </svg>
            <span>
              Something went wrong while calculating your results. Please refresh the page and try again — your
              inputs were never sent anywhere and nothing was saved.
            </span>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
