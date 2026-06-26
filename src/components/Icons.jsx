// Inline SVG icons used across the site.
// All icons follow the same 24x24 viewBox and use currentColor for theming.

const baseProps = {
  width: 28,
  height: 28,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
};

export const IconShield = (props) => (
  <svg {...baseProps} {...props}>
    <path d="M12 2L4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5l-8-3z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

export const IconHandshake = (props) => (
  <svg {...baseProps} {...props}>
    <path d="M11 17L6.5 12.5a2 2 0 010-2.8l3-3a2 2 0 012.8 0L17 11" />
    <path d="M13 7l4-4 4 4-3 3" />
    <path d="M3 13l4 4 4-4" />
    <path d="M14 14l3 3" />
    <path d="M11 17l3 3" />
  </svg>
);

export const IconScroll = (props) => (
  <svg {...baseProps} {...props}>
    <path d="M8 2h10a2 2 0 012 2v4H8" />
    <path d="M6 22h10a2 2 0 002-2V8" />
    <path d="M2 6a2 2 0 012-2h4v18H4a2 2 0 01-2-2V6z" />
    <path d="M11 12h7M11 16h7" />
  </svg>
);

export const IconSearch = (props) => (
  <svg {...baseProps} {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </svg>
);

export const IconChat = (props) => (
  <svg {...baseProps} {...props}>
    <path d="M21 12a8 8 0 11-3.1-6.3l3.1-.7-.8 3.1A8 8 0 0121 12z" />
    <path d="M8 11h.01M12 11h.01M16 11h.01" />
  </svg>
);

export const IconKey = (props) => (
  <svg {...baseProps} {...props}>
    <circle cx="7.5" cy="15.5" r="3.5" />
    <path d="M11 12l9-9" />
    <path d="M17 6l3 3M15 8l3 3" />
  </svg>
);

export const IconGlobe = (props) => (
  <svg {...baseProps} {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
  </svg>
);

export const IconChart = (props) => (
  <svg {...baseProps} {...props}>
    <path d="M3 3v18h18" />
    <path d="M7 14l3-3 3 3 5-5" />
  </svg>
);

export const IconUsers = (props) => (
  <svg {...baseProps} {...props}>
    <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  </svg>
);

export const IconBalance = (props) => (
  <svg {...baseProps} {...props}>
    <path d="M12 3v18" />
    <path d="M5 21h14" />
    <path d="M7 7l-3 7a3 3 0 006 0L7 7z" />
    <path d="M17 7l-3 7a3 3 0 006 0l-3-7z" />
    <path d="M7 7h10" />
  </svg>
);

export const IconArrowLeft = (props) => (
  <svg {...baseProps} {...props}>
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

export const IconArrowDown = (props) => (
  <svg {...baseProps} {...props}>
    <path d="M12 5v14M5 12l7 7 7-7" />
  </svg>
);
