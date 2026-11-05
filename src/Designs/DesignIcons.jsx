/*
    Custom icon set for the reference designs.

    The drawing used stock cloud-provider artwork; these are drawn in the site's
    own palette so a design reads as part of the page instead of a screenshot.
*/

const BLUE = "var(--brand-deep)";
const VIOLET = "var(--violet)";
const TILE = "var(--bg-tint)";
const EDGE = "var(--line-strong)";

function Glyph({ children }) {
    return (
        <g fill="none" stroke={BLUE} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </g>
    );
}

function Frame({ children }) {
    return (
        <svg className="design-icon" viewBox="0 0 64 64" role="presentation" focusable="false">
            <rect x="2" y="2" width="60" height="60" rx="15" fill={TILE} stroke={EDGE} strokeWidth="1.6" />
            {children}
        </svg>
    );
}

const ICONS = {
    browser: (
        <Frame>
            <rect x="15" y="17" width="34" height="30" rx="4" fill="#ffffff" stroke={BLUE} strokeWidth="2.6" />
            <path d="M15 25h34" stroke={BLUE} strokeWidth="2.6" strokeLinecap="round" />
            <circle cx="21" cy="21" r="1.6" fill={BLUE} />
            <circle cx="26" cy="21" r="1.6" fill={BLUE} />
            <Glyph>
                <path d="M21 32h10M21 38h20M21 43h14" />
            </Glyph>
        </Frame>
    ),

    database: (
        <Frame>
            <Glyph>
                <ellipse cx="32" cy="20" rx="13" ry="5" fill="#ffffff" />
                <path d="M19 20v23c0 2.8 5.8 5 13 5s13-2.2 13-5V20" fill="#ffffff" />
                <path d="M19 31c0 2.8 5.8 5 13 5s13-2.2 13-5" />
            </Glyph>
        </Frame>
    ),

    cache: (
        <Frame>
            <Glyph>
                <ellipse cx="30" cy="20" rx="12" ry="4.6" fill="#ffffff" />
                <path d="M18 20v22c0 2.6 5.4 4.6 12 4.6s12-2 12-4.6V20" fill="#ffffff" />
                <path d="M18 31c0 2.6 5.4 4.6 12 4.6s12-2 12-4.6" />
            </Glyph>
            <path d="M45 30l-7 11h5l-2 8 8-12h-5l3-7z" fill={VIOLET} stroke="none" />
        </Frame>
    ),

    gateway: (
        <Frame>
            <Glyph>
                <path d="M17 46V29a15 15 0 0 1 30 0v17" fill="#ffffff" />
                <path d="M24 46V30a8 8 0 0 1 16 0v16" />
                <path d="M13 46h38" />
            </Glyph>
            <circle cx="32" cy="38" r="2.6" fill={VIOLET} />
        </Frame>
    ),

    loadbalancer: (
        <Frame>
            <Glyph>
                <path d="M32 15v12M32 37v12M15 32h12M37 32h12" />
                <path d="M32 12l-3.4 4h6.8zM32 52l-3.4-4h6.8zM12 32l4-3.4v6.8zM52 32l-4-3.4v6.8z" fill={BLUE} stroke="none" />
            </Glyph>
            <circle cx="32" cy="32" r="6" fill="#ffffff" stroke={BLUE} strokeWidth="2.6" />
            <circle cx="32" cy="32" r="2.2" fill={VIOLET} />
        </Frame>
    ),

    firewall: (
        <Frame>
            <rect x="15" y="18" width="34" height="28" rx="4" fill="#ffffff" stroke={BLUE} strokeWidth="2.6" />
            <path
                d="M15 27.5h34M15 36.5h34M26 18v9.5M38 18v9.5M21 27.5v9M33 27.5v9M26 36.5V46M38 36.5V46"
                stroke={BLUE}
                strokeWidth="2.2"
                strokeLinecap="round"
            />
            <circle cx="45" cy="42" r="7" fill={VIOLET} stroke="#ffffff" strokeWidth="2" />
            <path d="M42.4 42l1.9 2 3.3-3.6" fill="none" stroke="#ffffff" strokeWidth="2.1" strokeLinecap="round" />
        </Frame>
    ),

    queue: (
        <Frame>
            <Glyph>
                <rect x="16" y="17" width="24" height="9" rx="2.6" fill="#ffffff" />
                <rect x="16" y="29" width="24" height="9" rx="2.6" fill="#ffffff" />
                <rect x="16" y="41" width="24" height="9" rx="2.6" fill="#ffffff" />
                <path d="M44 32h6M47 28.6l3.4 3.4-3.4 3.4" stroke={VIOLET} />
            </Glyph>
        </Frame>
    ),

    compute: (
        <Frame>
            <Glyph>
                <path
                    d="M24 43h18a8 8 0 0 0 1-15.9 11 11 0 0 0-20.7-2.6A8.2 8.2 0 0 0 24 43z"
                    fill="#ffffff"
                />
                <path d="M27 33h11M34.4 29.6L38 33l-3.6 3.4" stroke={VIOLET} />
            </Glyph>
        </Frame>
    ),

    identity: (
        <Frame>
            <Glyph>
                <path d="M32 13l14 5v11c0 9-6 15.6-14 19-8-3.4-14-10-14-19V18l14-5z" fill="#ffffff" />
                <circle cx="32" cy="27" r="4.2" />
                <path d="M24 40c1.6-4 4.4-6 8-6s6.4 2 8 6" />
            </Glyph>
            <path d="M45 36h8M49 32v8" stroke={VIOLET} strokeWidth="2.6" strokeLinecap="round" />
        </Frame>
    ),

    ledger: (
        <Frame>
            <Glyph>
                <rect x="20" y="17" width="24" height="30" rx="4" fill="#ffffff" />
                <path d="M27 15h10a2 2 0 0 1 2 2v2H25v-2a2 2 0 0 1 2-2z" fill="#ffffff" />
                <path d="M26 27h12M26 33h12M26 39h7" />
            </Glyph>
            <circle cx="44" cy="42" r="7.4" fill={VIOLET} stroke="#ffffff" strokeWidth="2" />
            <path d="M41.2 42l1.9 2 3.4-3.8" fill="none" stroke="#ffffff" strokeWidth="2.1" strokeLinecap="round" />
        </Frame>
    ),

    users: (
        <Frame>
            <Glyph>
                <circle cx="26" cy="24" r="5.4" fill="#ffffff" />
                <path d="M15 44c0-6 5-10 11-10s11 4 11 10" fill="#ffffff" />
            </Glyph>
            <g fill="none" stroke={VIOLET} strokeWidth="2.4" strokeLinecap="round">
                <circle cx="41" cy="27" r="4.4" />
                <path d="M36 45c0-4.4 3-7.6 6.8-7.6 3.6 0 6.2 3 6.2 7.6" />
            </g>
        </Frame>
    ),

    analytics: (
        <Frame>
            <Glyph>
                <path d="M17 17v30h30" />
                <path d="M24 40v-9M31 40v-15M38 40v-6" strokeWidth="3.4" />
            </Glyph>
            <path d="M22 27l7-6 6 5 9-9" fill="none" stroke={VIOLET} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </Frame>
    ),

    repository: (
        <Frame>
            <Glyph>
                <path d="M22 16h16a4 4 0 0 1 4 4v28a4 4 0 0 1-4 4H22a4 4 0 0 1-4-4V20a4 4 0 0 1 4-4z" fill="#ffffff" />
                <circle cx="27" cy="27" r="2.8" />
                <circle cx="27" cy="39" r="2.8" />
                <path d="M37 24v9a5 5 0 0 1-5 5h-2" />
                <circle cx="37" cy="21" r="2.4" fill={VIOLET} stroke="none" />
            </Glyph>
        </Frame>
    ),

    pipeline: (
        <Frame>
            <Glyph>
                <rect x="14" y="24" width="9" height="9" rx="2.4" fill="#ffffff" />
                <rect x="28" y="24" width="9" height="9" rx="2.4" fill="#ffffff" />
                <path d="M47 26.5v-5.5M41.5 24l5.5-3 5.5 3M41.5 34l5.5 3 5.5-3" stroke={VIOLET} strokeWidth="2.2" />
                <path d="M24 28.5h3M38 28.5h3" />
                <path d="M20 46h24" strokeDasharray="3 4" />
            </Glyph>
        </Frame>
    ),

    build: (
        <Frame>
            <Glyph>
                <path d="M40 20a8 8 0 0 0-10.4 10.4L18 42l4 4 11.6-11.6A8 8 0 0 0 44 24l-4.6 4.6-4-4L40 20z" fill="#ffffff" />
            </Glyph>
            <circle cx="43" cy="41" r="6.4" fill={VIOLET} stroke="#ffffff" strokeWidth="2" />
            <path d="M40.6 41l1.7 1.8 3.2-3.4" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
        </Frame>
    ),

    scan: (
        <Frame>
            <rect x="18" y="14" width="22" height="28" rx="3.6" fill="#ffffff" stroke={BLUE} strokeWidth="2.6" />
            <path d="M23 22h12M23 28h12M23 34h7" fill="none" stroke={BLUE} strokeWidth="2.4" strokeLinecap="round" />
            <circle cx="38" cy="37" r="8.4" fill="#ffffff" stroke={VIOLET} strokeWidth="2.8" />
            <path d="M44.2 43.2L49 48" fill="none" stroke={VIOLET} strokeWidth="3" strokeLinecap="round" />
        </Frame>
    ),

    integration: (
        <Frame>
            <Glyph>
                <path d="M18 20h11v11H18z" fill="#ffffff" />
                <path d="M29 25.5h4M33 20a3.5 3.5 0 1 1 0 7" stroke={VIOLET} />
                <path d="M22 39h11v11H22z" fill="#ffffff" />
                <path d="M27.5 39v-4M33 44.5h5" />
            </Glyph>
        </Frame>
    ),

    replication: (
        <Frame>
            <Glyph>
                <ellipse cx="24" cy="23" rx="9" ry="3.6" fill="#ffffff" />
                <path d="M15 23v13c0 2 4 3.6 9 3.6s9-1.6 9-3.6V23" fill="#ffffff" />
                <ellipse cx="43" cy="33" rx="8" ry="3.2" fill="#ffffff" />
                <path d="M35 33v11c0 1.8 3.6 3.2 8 3.2s8-1.4 8-3.2V33" fill="#ffffff" />
                <path d="M28 30l6-1" stroke={VIOLET} />
            </Glyph>
        </Frame>
    ),

    deploy: (
        <Frame>
            <Glyph>
                <path d="M22 42h18a7.6 7.6 0 0 0 .9-15.1A10.4 10.4 0 0 0 21.4 24A7.8 7.8 0 0 0 22 42z" fill="#ffffff" />
            </Glyph>
            <path d="M32 36V23M27.6 27.4L32 23l4.4 4.4" fill="none" stroke={VIOLET} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </Frame>
    ),

    security: (
        <Frame>
            <path d="M32 13l13 4.6v11.2c0 8.8-5.6 15-13 18.2-7.4-3.2-13-9.4-13-18.2V17.6L32 13z" fill="#ffffff" stroke={BLUE} strokeWidth="2.6" strokeLinejoin="round" />
            <rect x="27" y="28" width="10" height="8.4" rx="2.2" fill={VIOLET} />
            <path d="M29 28v-2.6a3 3 0 0 1 6 0V28" fill="none" stroke={VIOLET} strokeWidth="2.2" />
        </Frame>
    ),

    health: (
        <Frame>
            <rect x="14" y="18" width="36" height="25" rx="4" fill="#ffffff" stroke={BLUE} strokeWidth="2.6" />
            <path d="M19 31h5l2.6-5.4 3.6 10 2.6-4.6h3.6" fill="none" stroke={VIOLET} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M26 49h12" fill="none" stroke={BLUE} strokeWidth="2.4" strokeLinecap="round" />
        </Frame>
    ),

    code: (
        <Frame>
            <Glyph>
                <path d="M25 23l-9 9 9 9M39 23l9 9-9 9" />
                <path d="M35 18l-7 28" stroke={VIOLET} />
            </Glyph>
        </Frame>
    ),

    certificate: (
        <Frame>
            <Glyph>
                <path d="M22 14h15l7 7v17H22z" fill="#ffffff" />
                <path d="M37 14v7h7" />
                <path d="M27 26h9M27 31h9" strokeWidth="2.2" />
            </Glyph>
            <circle cx="28" cy="40" r="7" fill="#ffffff" stroke={VIOLET} strokeWidth="2.6" />
            <path d="M24.6 46l-1.6 8 5-2.6 5 2.6-1.6-8" fill={VIOLET} stroke="none" />
        </Frame>
    ),

    hsm: (
        <Frame>
            <Glyph>
                <rect x="18" y="15" width="28" height="34" rx="4" fill="#ffffff" />
                <path d="M18 24h28M18 33h28" strokeWidth="2.2" />
                <circle cx="23.5" cy="19.5" r="1.5" fill={BLUE} stroke="none" />
                <circle cx="23.5" cy="28.5" r="1.5" fill={BLUE} stroke="none" />
            </Glyph>
            <circle cx="41" cy="38" r="7.4" fill={VIOLET} stroke="#ffffff" strokeWidth="2" />
            <circle cx="41" cy="36.4" r="1.8" fill="#ffffff" stroke="none" />
            <path d="M41 37.8v3.4" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
        </Frame>
    ),

    vault: (
        <Frame>
            <Glyph>
                <path
                    d="M23 42h18a7.6 7.6 0 0 0 .9-15.1A10.4 10.4 0 0 0 22.4 24A7.8 7.8 0 0 0 23 42z"
                    fill="#ffffff"
                />
            </Glyph>
            <rect x="27" y="30" width="11" height="9" rx="2.4" fill={VIOLET} />
            <path d="M29.4 30v-2.6a3.1 3.1 0 0 1 6.2 0V30" fill="none" stroke={VIOLET} strokeWidth="2.2" />
        </Frame>
    ),

    tpm: (
        <Frame>
            <Glyph>
                <rect x="20" y="20" width="24" height="24" rx="4" fill="#ffffff" />
                <path d="M26 14v6M32 14v6M38 14v6M26 44v6M32 44v6M38 44v6M14 26h6M14 32h6M14 38h6M44 26h6M44 32h6M44 38h6" strokeWidth="2.2" />
            </Glyph>
            <rect x="28.6" y="30.4" width="8.8" height="7" rx="1.8" fill={VIOLET} />
            <path d="M30.4 30.4v-2.2a2.6 2.6 0 0 1 5.2 0V30.4" fill="none" stroke={VIOLET} strokeWidth="2" />
        </Frame>
    ),

    lock: (
        <Frame>
            <rect x="21" y="29" width="22" height="19" rx="4.6" fill="#ffffff" stroke={BLUE} strokeWidth="2.6" />
            <path d="M26 29v-4.6a6 6 0 0 1 12 0V29" fill="none" stroke={BLUE} strokeWidth="2.6" strokeLinecap="round" />
            <circle cx="32" cy="36.4" r="2.2" fill={VIOLET} />
            <path d="M32 38.4v4.2" fill="none" stroke={VIOLET} strokeWidth="2.4" strokeLinecap="round" />
        </Frame>
    ),

    key: (
        <Frame>
            <Glyph>
                <circle cx="25" cy="25" r="8" fill="#ffffff" />
                <circle cx="25" cy="25" r="3" stroke={VIOLET} />
                <path d="M31 31l12 12" />
                <path d="M39 39l3.4-3.4M43.6 43.6l3.4-3.4" strokeWidth="2.2" />
            </Glyph>
        </Frame>
    ),

    salt: (
        <Frame>
            <Glyph>
                <path d="M24 15h16v10H24z" fill="#ffffff" />
                <path d="M24 25h16l-2.2 22a4.4 4.4 0 0 1-4.4 4H30.6a4.4 4.4 0 0 1-4.4-4z" fill="#ffffff" />
                <path d="M24 15v10M40 15v10M24 25h16" strokeWidth="2.2" />
                <circle cx="28.5" cy="20" r="1.2" fill={VIOLET} stroke="none" />
                <circle cx="35.5" cy="20" r="1.2" fill={VIOLET} stroke="none" />
                <circle cx="29" cy="31" r="1" fill={VIOLET} stroke="none" />
                <circle cx="35" cy="36" r="1" fill={VIOLET} stroke="none" />
                <circle cx="30" cy="41" r="1" fill={VIOLET} stroke="none" />
            </Glyph>
        </Frame>
    ),

    cipher: (
        <Frame>
            <Glyph>
                <rect x="17" y="20" width="30" height="23" rx="3.4" fill="#ffffff" />
                <path d="M17 23l15 11 15-11" strokeWidth="2.2" />
            </Glyph>
            <circle cx="41" cy="41" r="7.2" fill={VIOLET} stroke="#ffffff" strokeWidth="2" />
            <rect x="38.2" y="39.6" width="5.6" height="4.4" rx="1.2" fill="#ffffff" stroke="none" />
        </Frame>
    ),

    pool: (
        <Frame>
            <Glyph>
                <circle cx="20" cy="20" r="4.4" fill="#ffffff" />
                <circle cx="20" cy="44" r="4.4" fill="#ffffff" />
                <circle cx="44" cy="32" r="4.4" fill="#ffffff" />
                <path d="M24.4 21.6l15.4 8.4M24.4 42.4l15.4-8.4" strokeWidth="2.2" />
                <path d="M14 32h6" stroke={VIOLET} strokeWidth="2.4" />
            </Glyph>
        </Frame>
    ),

    rack: (
        <Frame>
            <Glyph>
                <rect x="19" y="14" width="26" height="36" rx="3.4" fill="#ffffff" />
                <path d="M19 24h26M19 34h26M19 44h26" strokeWidth="2.2" />
                <circle cx="25" cy="19" r="1.6" fill={VIOLET} stroke="none" />
                <circle cx="25" cy="29" r="1.6" fill={VIOLET} stroke="none" />
                <circle cx="25" cy="39" r="1.6" fill={VIOLET} stroke="none" />
                <path d="M31 19h9M31 29h9M31 39h9" strokeWidth="2" />
            </Glyph>
        </Frame>
    ),
};

export default function DesignIcon({ role }) {
    return ICONS[role] || null;
}
