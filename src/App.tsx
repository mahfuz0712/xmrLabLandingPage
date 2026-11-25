import { useEffect, useState, type ReactNode } from "react";
import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Code2,
  Cpu,
  Github,
  Menu,
  Shield,
  Terminal,
  Usb,
  Wifi,
  X,
  Zap,
} from "lucide-react";

const GITHUB_URL = "https://github.com/mahfuz0712/XMR-Lab";
const RELEASES_URL = `${GITHUB_URL}/releases`;
const REPO_API =
  "https://api.github.com/repos/mahfuz0712/XMR-Lab/releases?per_page=100";

// Only accept tags like 1.0.0, 1.2.3, 10.20.30
// Tags like v1.0.0, latest, beta, etc. are ignored.
const VERSION_TAG = /^\d+\.\d+\.\d+$/;

type ReleaseAsset = {
  name: string;
  browser_download_url?: string;
};

type GitHubRelease = {
  draft: boolean;
  prerelease: boolean;
  tag_name: string;
  assets?: ReleaseAsset[];
};

type ReleaseWithApk = GitHubRelease & {
  apk: ReleaseAsset;
};

type ReleaseStatus = "loading" | "ready" | "empty" | "error";

type DownloadLinkProps = {
  className?: string;
  children: ReactNode;
  fallback?: string;
};

function compareVersions(a: string, b: string) {
  const left = a.split(".").map(Number);
  const right = b.split(".").map(Number);

  for (let i = 0; i < 3; i++) {
    if (left[i] !== right[i]) {
      return left[i] - right[i];
    }
  }

  return 0;
}

function useLatestApk() {
  const [release, setRelease] = useState<ReleaseWithApk | null>(null);
  const [status, setStatus] = useState<ReleaseStatus>("loading");

  useEffect(() => {
    let active = true;

    fetch(REPO_API, {
      headers: {
        Accept: "application/vnd.github+json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`GitHub API returned ${response.status}`);
        }

        return response.json();
      })
      .then((data: GitHubRelease[]) => {
        const candidates = data
          .filter(
            (item) =>
              !item.draft &&
              !item.prerelease &&
              VERSION_TAG.test(item.tag_name || ""),
          )
          .map((item) => ({
            ...item,
            apk: (item.assets || []).find((asset) =>
              /\.apk$/i.test(asset.name || ""),
            ),
          }))
          .filter(
            (item): item is ReleaseWithApk =>
              Boolean(item.apk?.browser_download_url),
          )
          .sort((a, b) => compareVersions(b.tag_name, a.tag_name));

        if (active) {
          setRelease(candidates[0] || null);
          setStatus(candidates.length ? "ready" : "empty");
        }
      })
      .catch(() => {
        if (active) {
          setStatus("error");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return { release, status };
}

function DownloadLink({
  className = "button button-primary",
  children,
  fallback = RELEASES_URL,
}: DownloadLinkProps) {
  const { release, status } = useLatestApk();

  if (status === "loading") {
    return (
      <a
        className={className}
        href={RELEASES_URL}
        target="_blank"
        rel="noreferrer"
      >
        {children}
      </a>
    );
  }

  if (release?.apk?.browser_download_url) {
    return (
      <a className={className} href={release.apk.browser_download_url} download>
        {children}
      </a>
    );
  }

  return (
    <a className={className} href={fallback} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

function LatestReleaseInfo() {
  const { release, status } = useLatestApk();

  if (status === "loading") {
    return <span className="release-version">CHECKING LATEST VERSION…</span>;
  }

  if (release) {
    return (
      <span className="release-version">
        LATEST VERSION <b>{release.tag_name}</b>
      </span>
    );
  }

  return (
    <span className="release-version">LATEST APK: CHECK GITHUB RELEASES</span>
  );
}

const features = [
  {
    icon: Terminal,
    code: "01 / TERMINAL",
    title: "Integrated terminal",
    text: "A command-line workspace built into the Android app for interacting with your Linux environment.",
  },
  {
    icon: Cpu,
    code: "02 / LINUX CORE",
    title: "User-Mode Linux",
    text: "Run a Linux environment through UML, without needing to root your Android device.",
  },
  {
    icon: Usb,
    code: "03 / USB",
    title: "USB passthrough",
    text: "Designed to connect supported USB devices to the guest environment through the USB/IP workflow.",
  },
  {
    icon: Wifi,
    code: "04 / CONNECTIVITY",
    title: "Wireless lab setup",
    text: "Explore supported USB wireless adapter workflows from a portable Android-based lab.",
  },
  {
    icon: Shield,
    code: "05 / ROOTLESS",
    title: "No root required",
    text: "Get started without unlocking your device or changing the Android system partition.",
  },
  {
    icon: Code2,
    code: "06 / OPEN SOURCE",
    title: "Built for exploration",
    text: "An open-source project for learning, experimentation, and portable Linux workflows.",
  },
] as const;

const slides = [
  {
    name: "Home dashboard",
    tag: "01 / OVERVIEW",
    description: "Your Linux workspace, one tap away.",
    visual: "home",
  },
  {
    name: "Terminal",
    tag: "02 / COMMAND LINE",
    description: "A focused terminal experience on Android.",
    visual: "terminal",
  },
  {
    name: "USB devices",
    tag: "03 / HARDWARE",
    description: "Manage supported USB device workflows.",
    visual: "usb",
  },
];

function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const close = () => setOpen(false);

  return (
    <header className="site-header">
      <div className="container nav-wrap">
        <Link to="/" className="brand" onClick={close}>
          <span className="brand-mark">X</span>
          <span>
            XMR<span className="cyan"> LAB</span>
            <small>ANDROID LINUX ENVIRONMENT</small>
          </span>
        </Link>

        <button
          className="mobile-toggle"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation"
        >
          {open ? <X /> : <Menu />}
        </button>

        <nav className={open ? "nav-links open" : "nav-links"}>
          <a
            href={location.pathname === "/" ? "#features" : "/#features"}
            onClick={close}
          >
            Features
          </a>
          <a
            href={location.pathname === "/" ? "#screenshots" : "/#screenshots"}
            onClick={close}
          >
            Screenshots
          </a>
          <NavLink to="/docs" onClick={close}>
            Documentation
          </NavLink>
          <a
            className="nav-github"
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            onClick={close}
          >
            <Github size={15} /> GitHub <ArrowUpRight size={13} />
          </a>
          <a
            className="nav-download"
            href={RELEASES_URL}
            target="_blank"
            rel="noreferrer"
            onClick={close}
          >
            <ArrowDownToLine size={15} /> Download
          </a>
        </nav>
      </div>
    </header>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="section-label">
      <span />
      {children}
    </div>
  );
}

function Hero() {
  return (
    <section className="hero container">
      <div className="hero-copy">
        <div className="eyebrow">
          <span className="pulse-dot" />
          OPEN-SOURCE ANDROID PROJECT
          <span className="eyebrow-line" />
        </div>

        <h1>
          Linux.
          <br />
          <span className="outline-text">Without</span>{" "}
          <span className="cyan">Limits.</span>
        </h1>

        <p className="hero-description">
          A rootless Linux environment for Android, powered by User-Mode Linux.
          Take your command-line workspace wherever you go.
        </p>

        <div className="hero-actions">
          <DownloadLink>
            <ArrowDownToLine size={17} />
            Download APK
            <ArrowUpRight size={15} />
          </DownloadLink>

          <a
            className="button button-ghost"
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
          >
            <Github size={17} />
            Explore source
          </a>
        </div>

        <div className="hero-release">
          <LatestReleaseInfo />
        </div>

        <div className="hero-meta">
          <span>
            <i className="meta-square" /> ROOTLESS BY DESIGN
          </span>
          <span>
            <i className="meta-square" /> UML POWERED
          </span>
          <span>
            <i className="meta-square" /> ANDROID
          </span>
        </div>
      </div>

      <div className="hero-art">
        <div className="art-top">
          <span>SYS / XMR-ENVIRONMENT</span>
          <span className="live">
            <i /> ONLINE CONCEPT
          </span>
        </div>

        <div className="orbit orbit-one" />
        <div className="orbit orbit-two" />

        <div className="core-card">
          <div className="core-top">
            <span>XMR // LAB</span>
            <span className="tiny-status">● SYSTEM READY</span>
          </div>
          <div className="core-symbol">
            <span>X</span>
            <div className="symbol-cross" />
          </div>
          <div className="core-title">LINUX ENVIRONMENT</div>
          <div className="core-sub">USER-MODE LINUX / ANDROID</div>
          <div className="core-bars">
            {Array.from({ length: 20 }, (_, i) => (
              <i key={i} />
            ))}
          </div>
          <div className="core-bottom">
            <span>SESSION: LOCAL</span>
            <span>MODE: ROOTLESS</span>
          </div>
        </div>

        <div className="float-chip chip-left">
          <Terminal size={15} />
          <span>
            TERMINAL<small>READY</small>
          </span>
        </div>

        <div className="float-chip chip-right">
          <Usb size={15} />
          <span>
            USB LINK<small>SUPPORTED WORKFLOW</small>
          </span>
        </div>

        <div className="art-coordinates">
          23°48' N / 90°24' E
          <br />
          BUILD YOUR OWN LAB
        </div>
        <div className="art-index">XMR_001</div>
      </div>

      <div className="hero-bottom-line">
        <span>01 — INTRODUCTION</span>
        <span>
          SCROLL TO EXPLORE <ChevronDown size={14} />
        </span>
        <span>EST. FOR EXPLORATION</span>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className="section container" id="features">
      <div className="section-heading">
        <div>
          <SectionLabel>CAPABILITIES / 001</SectionLabel>
          <h2>
            A portable lab.
            <br />
            <span className="muted-heading">Powerful possibilities.</span>
          </h2>
        </div>
        <p>
          XMR Lab brings together the building blocks for a practical Linux
          workspace on Android.
        </p>
      </div>

      <div className="feature-grid">
        {features.map(({ icon: Icon, code, title, text }) => (
          <article className="feature-card" key={title}>
            <div className="feature-card-top">
              <Icon size={19} />
              <span>{code}</span>
            </div>
            <h3>{title}</h3>
            <p>{text}</p>
            <div className="feature-arrow">
              <ArrowUpRight size={15} />
            </div>
          </article>
        ))}
      </div>

      <p className="fine-print">
        Feature availability depends on device compatibility, supported
        hardware, and the current project build.
      </p>
    </section>
  );
}

function ScreenshotMock({
  visual,
}: {
  visual: (typeof slides)[number]["visual"];
}) {
  return (
    <div className={`device-screen ${visual}`}>
      <div className="mock-status">
        <span>9:41</span>
        <span>◌ ◌ ▰</span>
      </div>

      {visual === "home" && (
        <>
          <div className="mock-brand">
            <b>
              XMR<span> LAB</span>
            </b>
            <small>LINUX ENVIRONMENT</small>
          </div>
          <div className="mock-welcome">
            Welcome back
            <span>YOUR WORKSPACE IS READY</span>
          </div>
          <div className="mock-launch">
            <div>
              <Terminal />
              <b>Terminal</b>
              <small>Open command line</small>
            </div>
            <div>
              <Cpu />
              <b>Linux</b>
              <small>Manage environment</small>
            </div>
          </div>
          <div className="mock-panel">
            <small>ENVIRONMENT STATUS</small>
            <strong>
              <i /> READY TO START
            </strong>
            <span>UML · ANDROID · ROOTLESS</span>
          </div>
        </>
      )}

      {visual === "terminal" && (
        <>
          <div className="mock-terminal-head">
            <Terminal size={16} /> TERMINAL <span>•••</span>
          </div>
          <div className="terminal-lines">
            <p>
              <b>user@xmr</b>:~$ uname -a
            </p>
            <p className="terminal-dim">Linux xmr-lab 6.x.x UML</p>
            <p>
              <b>user@xmr</b>:~$ ls
            </p>
            <p className="terminal-cyan">
              home&nbsp;&nbsp; usr&nbsp;&nbsp; etc&nbsp;&nbsp; var
            </p>
            <p>
              <b>user@xmr</b>:~$ <i className="cursor" />
            </p>
          </div>
          <div className="mock-terminal-foot">
            SESSION ACTIVE <span>LOCAL SHELL</span>
          </div>
        </>
      )}

      {visual === "usb" && (
        <>
          <div className="mock-brand">
            <b>
              DEVICE<span> MANAGER</span>
            </b>
            <small>USB CONNECTION</small>
          </div>
          <div className="mock-usb">
            <Usb />
            <div>
              <b>USB DEVICE</b>
              <small>External hardware</small>
            </div>
            <span className="mock-tag">DETECTED</span>
          </div>
          <div className="mock-panel">
            <small>CONNECTION MODE</small>
            <strong>USB / IP WORKFLOW</strong>
            <span>DEVICE SUPPORT MAY VARY</span>
          </div>
          <div className="mock-usb-note">
            Connect a supported device to begin.
          </div>
        </>
      )}
    </div>
  );
}

function Screenshots() {
  const [active, setActive] = useState(0);
  const slide = slides[active];

  const prev = () => setActive((active + slides.length - 1) % slides.length);
  const next = () => setActive((active + 1) % slides.length);

  return (
    <section className="section screenshot-section" id="screenshots">
      <div className="container">
        <div className="section-heading">
          <div>
            <SectionLabel>INTERFACE / 002</SectionLabel>
            <h2>
              Inside the <span className="cyan">lab.</span>
            </h2>
          </div>
          <p>
            A preview of the XMR Lab experience. Replace these illustrative
            previews with actual app screenshots when available.
          </p>
        </div>

        <div className="showcase">
          <div className="showcase-info">
            <span className="slide-count">
              0{active + 1} <i>/ 0{slides.length}</i>
            </span>
            <h3>{slide.name}</h3>
            <p>{slide.description}</p>

            <div className="slider-controls">
              <button onClick={prev} aria-label="Previous screenshot">
                <ChevronLeft />
              </button>
              <button onClick={next} aria-label="Next screenshot">
                <ChevronRight />
              </button>
            </div>

            <div className="slider-dots">
              {slides.map((s, i) => (
                <button
                  key={s.name}
                  className={i === active ? "active" : ""}
                  onClick={() => setActive(i)}
                  aria-label={`Show ${s.name}`}
                />
              ))}
            </div>
          </div>

          <div className="showcase-visual">
            <div className="screen-frame">
              <div className="screen-frame-bar">
                <span />
                <span />
                <span />
                <b>{slide.tag}</b>
              </div>
              <ScreenshotMock visual={slide.visual} />
            </div>
            <div className="screen-caption">
              XMR LAB / UI PREVIEW
              <span>ILLUSTRATIVE MOCKUP</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Download() {
  return (
    <section className="section container" id="download">
      <div className="download-panel">
        <div className="download-grid-bg" />

        <div className="download-copy">
          <SectionLabel>GET STARTED / 003</SectionLabel>
          <h2>
            Your lab.
            <br />
            <span className="cyan">Your device.</span>
          </h2>
          <p>
            Ready to explore? Get the latest available build from the project's
            GitHub Releases page.
          </p>

          <DownloadLink>
            <ArrowDownToLine size={17} />
            Download latest APK
            <ArrowUpRight size={15} />
          </DownloadLink>

          <small className="download-note">
            Check release notes and device requirements before installing.
          </small>
        </div>

        <div className="download-side">
          <div className="download-icon">
            <ArrowDownToLine size={28} />
          </div>
          <span className="download-kicker">LATEST RELEASE</span>
          <strong>Get XMR Lab</strong>
          <p>APK releases and build information are hosted on GitHub.</p>
          <a href={RELEASES_URL} target="_blank" rel="noreferrer">
            OPEN RELEASES <ArrowUpRight size={14} />
          </a>
          <div className="release-status">
            <i /> GITHUB RELEASES
          </div>
        </div>
      </div>
    </section>
  );
}

function Docs() {
  const [selected, setSelected] = useState("overview");

  const topics = [
    { id: "overview", name: "Overview" },
    { id: "requirements", name: "Requirements" },
    { id: "install", name: "Installation" },
    { id: "terminal", name: "Using the terminal" },
    { id: "wifi", name: "Wi-Fi adapters" },
    { id: "driver-install", name: "Install Wi-Fi drivers" },
    { id: "driver-build", name: "Build drivers from source" },
    { id: "usb", name: "USB passthrough" },
    { id: "troubleshooting", name: "Troubleshooting" },
  ];

  const currentIndex = topics.findIndex((t) => t.id === selected);
  const current = topics[currentIndex];
  const nextTopic = topics[(currentIndex + 1) % topics.length];

  const supported = [
    ["Atheros AR9271 / AR7010", "ath9k_htc", "2.4 GHz / Dual"],
    ["Atheros AR9170", "carl9170", "Dual-band"],
    ["Realtek RTL8188CUS", "rtl8xxxu", "2.4 GHz"],
    ["Realtek RTL8192CU / EU", "rtl8xxxu / rtl8192cu", "2.4 GHz"],
    ["Realtek RTL8812AU", "rtw88_8812au", "Dual-band"],
    ["Realtek RTL8821CU", "rtw88_8821cu", "Dual-band"],
    ["Realtek RTL8822BU / CU", "rtw88_8822bu / rtw88_8822cu", "Dual-band"],
    ["Realtek RTL8814AU", "rtw88_8814au", "Dual-band"],
    ["MediaTek MT7601U", "mt7601u", "2.4 GHz"],
    ["MediaTek MT7610U", "mt76x0u", "Dual-band"],
    ["MediaTek MT7612U", "mt76x2u", "Dual-band"],
    ["MediaTek MT7663U", "mt7663u", "Dual-band"],
    ["MediaTek MT7921U / MT7925U", "mt7921u / mt7925u", "Dual-band"],
    ["Ralink RT5370 / RT3070", "rt2800usb", "2.4 GHz"],
    ["Ralink RT3572 / RT5572", "rt2800usb", "Dual-band"],
    ["ZyDAS ZD1211", "zd1211rw", "2.4 GHz"],
    ["Intersil P54 USB", "p54usb", "Depends on device"],
  ];

  const renderContent = () => {
    switch (selected) {
      case "overview":
        return (
          <>
            <h2>Welcome to XMR Lab</h2>
            <p>
              XMR Lab is an Android-based Linux environment powered by User-Mode
              Linux and a Linux guest system. It provides a portable
              command-line workspace without requiring root access on your
              Android device.
            </p>
            <div className="docs-callout">
              <Zap size={17} />
              <p>
                <b>Rootless by design.</b>
                <br />
                USB devices are passed from Android into the Linux guest, where
                the guest kernel handles their drivers.
              </p>
            </div>
          </>
        );

      case "requirements":
        return (
          <>
            <h2>Before you begin</h2>
            <p>Make sure your device meets the current release requirements.</p>
            <ul className="docs-list">
              <li>Android 7.0 (API 24) or newer</li>
              <li>64-bit ARM device (arm64-v8a)</li>
              <li>Enough free storage for the Linux environment</li>
              <li>USB OTG support for external USB adapters</li>
            </ul>
            <p>
              Requirements may change between releases. Check the release notes
              before installing.
            </p>
          </>
        );

      case "install":
        return (
          <>
            <h2>Install XMR Lab</h2>
            <ol className="docs-list ordered">
              <li>
                Visit the{" "}
                <a href={RELEASES_URL} target="_blank" rel="noreferrer">
                  GitHub Releases
                </a>{" "}
                page.
              </li>
              <li>Download the latest APK.</li>
              <li>Install the APK on your Android device.</li>
              <li>Open XMR Lab and complete the initial setup.</li>
            </ol>
          </>
        );

      case "terminal":
        return (
          <>
            <h2>Using the terminal</h2>
            <p>
              Open the integrated terminal to access the Linux guest
              environment. You can use standard Linux commands and install
              supported packages through APT.
            </p>
            <pre className="docs-code">
              <code>{`whoami
uname -a
ip addr
iw dev
lsusb`}</code>
            </pre>
          </>
        );

      case "wifi":
        return (
          <>
            <h2>Supported Wi-Fi adapters</h2>
            <p>
              XMR Lab supports selected USB Wi-Fi adapters through its Linux
              guest kernel. Compatibility depends on the exact chipset, hardware
              revision, kernel driver and firmware.
            </p>

            <h3>Recommended adapters</h3>

            <div className="docs-adapter-list">
              {[
                {
                  name: "TP-Link TL-WN722N V1",
                  chipset: "Atheros AR9271",
                  driver: "ath9k_htc",
                  band: "2.4 GHz",
                  status: "Recommended",
                  note: "Only hardware revision V1. V2 and V3 use different chipsets.",
                },
                {
                  name: "Alfa AWUS036NHA",
                  chipset: "Atheros AR9271",
                  driver: "ath9k_htc",
                  band: "2.4 GHz",
                  status: "Recommended",
                  note: "A well-known AR9271-based reference adapter.",
                },
                {
                  name: "Alfa AWUS036NH",
                  chipset: "Ralink RT3070 family",
                  driver: "rt2800usb",
                  band: "2.4 GHz",
                  status: "Expected",
                  note: "Verify the exact hardware revision and USB ID.",
                },
                {
                  name: "Alfa AWUS036ACM",
                  chipset: "MediaTek MT7612U",
                  driver: "mt76x2u",
                  band: "2.4 / 5 GHz",
                  status: "Expected",
                  note: "Dual-band adapter with mainline Linux driver support.",
                },
              ].map((adapter) => (
                <div className="docs-adapter-card" key={adapter.name}>
                  <div className="docs-adapter-heading">
                    <div>
                      <h4>{adapter.name}</h4>
                      <span>{adapter.chipset}</span>
                    </div>
                    <span
                      className={`adapter-status ${
                        adapter.status === "Recommended"
                          ? "recommended"
                          : "expected"
                      }`}
                    >
                      {adapter.status}
                    </span>
                  </div>

                  <div className="docs-adapter-meta">
                    <span>
                      DRIVER <code>{adapter.driver}</code>
                    </span>
                    <span>
                      BAND <b>{adapter.band}</b>
                    </span>
                  </div>

                  <p>{adapter.note}</p>
                </div>
              ))}
            </div>

            <h3>Other compatible chipset families</h3>

            <div className="docs-table-wrap">
              <table className="docs-table">
                <thead>
                  <tr>
                    <th>Adapter model / family</th>
                    <th>Chipset</th>
                    <th>Driver</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>TP-Link TL-WN722N V2/V3</td>
                    <td>RTL8188EUS</td>
                    <td>rtl8xxxu</td>
                  </tr>
                  <tr>
                    <td>Alfa AWUS036ACH</td>
                    <td>RTL8812AU</td>
                    <td>rtw88 / external</td>
                  </tr>
                  <tr>
                    <td>Alfa AWUS036ACU</td>
                    <td>RTL8812AU family</td>
                    <td>External driver</td>
                  </tr>
                  <tr>
                    <td>ASUS USB-AC56</td>
                    <td>RTL8812AU family</td>
                    <td>External driver</td>
                  </tr>
                  <tr>
                    <td>TP-Link Archer T4U V3</td>
                    <td>RTL8812BU family</td>
                    <td>External driver</td>
                  </tr>
                  <tr>
                    <td>TP-Link Archer T2U Plus</td>
                    <td>RTL8821AU family</td>
                    <td>External driver</td>
                  </tr>
                  <tr>
                    <td>D-Link DWA-131</td>
                    <td>Revision dependent</td>
                    <td>rtl8xxxu / external</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="docs-callout">
              <Wifi size={17} />
              <p>
                <b>Check the hardware revision before buying.</b>
                <br />
                Adapter names alone do not guarantee chipset compatibility.
                Different hardware revisions can use completely different
                chipsets and drivers.
              </p>
            </div>

            <h3>How to identify your adapter</h3>
            <pre className="docs-code">
              <code>{`lsusb
lsusb -t
dmesg | tail -n 60
iw dev`}</code>
            </pre>

            <p>
              Use the USB Vendor ID, Product ID and actual chipset to identify
              the correct driver. Monitor mode and packet injection support must
              be verified separately.
            </p>
          </>
        );

      case "driver-install":
        return (
          <>
            <h2>Install a Wi-Fi driver</h2>
            <p>
              If your adapter is detected but no wireless interface appears, its
              driver or firmware may be missing.
            </p>

            <h3>Step 1 — Identify the chipset</h3>
            <p>
              Connect the adapter and run these commands in the Linux guest
              terminal:
            </p>
            <pre className="docs-code">
              <code>{`lsusb
dmesg | tail -n 60
lsusb -t
iw dev`}</code>
            </pre>

            <p>
              Find the USB vendor ID, product ID, and chipset. Do not select a
              driver using the adapter's marketing name alone.
            </p>

            <h3>Step 2 — Install firmware</h3>
            <p>
              Update the package list and install the firmware package matching
              your chipset:
            </p>
            <pre className="docs-code">
              <code>{`sudo apt update

# Realtek firmware
sudo apt install firmware-realtek

# Atheros firmware
sudo apt install firmware-atheros firmware-ath9k-htc

# MediaTek firmware
sudo apt install firmware-mediatek

# Regulatory database
sudo apt install wireless-regdb`}</code>
            </pre>

            <p>
              Install only the firmware package relevant to your adapter. Some
              drivers require firmware files even when the kernel driver itself
              is already present.
            </p>

            <h3>Step 3 — Install an additional driver package</h3>
            <p>
              XMR Lab's image build system includes optional out-of-tree driver
              packages. When the matching package is available in the guest's
              configured APT repository, install it with:
            </p>
            <pre className="docs-code">
              <code>{`sudo apt update
sudo apt install stryker-driver-rtl8812au`}</code>
            </pre>

            <p>Other optional driver package names include:</p>
            <pre className="docs-code">
              <code>{`stryker-driver-rtl8812au
stryker-driver-rtl8821cu
stryker-driver-rtl88x2bu
stryker-driver-rtl8192eu
stryker-driver-rtl8814au`}</code>
            </pre>

            <p>
              These are the optional driver targets defined by the project's
              driver build list. A package must first be built and published for
              your guest kernel version before APT can install it.
            </p>

            <h3>Step 4 — Reload and verify</h3>
            <pre className="docs-code">
              <code>{`sudo depmod -a
sudo modprobe DRIVER_NAME

iw dev
ip link
dmesg | tail -n 60`}</code>
            </pre>

            <div className="docs-callout">
              <Shield size={17} />
              <p>
                <b>Important:</b> Never force-load a module built for a
                different kernel version. An incompatible module can fail with
                an invalid module format error.
              </p>
            </div>
          </>
        );

      case "driver-build":
        return (
          <>
            <h2>Build a driver from source</h2>
            <p>
              If your adapter is not covered by the built-in drivers or
              available optional packages, you may need to compile an
              out-of-tree Linux kernel module.
            </p>

            <div className="docs-callout">
              <Code2 size={17} />
              <p>
                <b>Build for the guest kernel, not Android.</b>
                <br />
                XMR Lab passes the USB adapter into its Linux guest. Compile the
                driver for the exact XMR Lab guest kernel and architecture. An
                Android kernel module is not a substitute.
              </p>
            </div>

            <h3>Build environment</h3>
            <p>
              Use a Linux build machine with the required cross compiler and
              kernel build dependencies:
            </p>
            <pre className="docs-code">
              <code>{`sudo apt update
sudo apt install git make gcc-aarch64-linux-gnu \\
  dpkg-dev bc flex bison libssl-dev`}</code>
            </pre>

            <h3>Step 1 — Get the XMR Lab source</h3>
            <pre className="docs-code">
              <code>{`git clone https://github.com/mahfuz0712/XMR-Lab.git
cd XMR-Lab`}</code>
            </pre>

            <h3>Step 2 — Build the matching guest kernel</h3>
            <p>
              The driver must match the kernel build tree, kernel configuration,
              architecture, and toolchain used by the guest image.
            </p>
            <pre className="docs-code">
              <code>{`images/kernel/build-vm.sh`}</code>
            </pre>

            <h3>Step 3 — Build an existing optional driver</h3>
            <p>
              The repository provides a driver build helper and a driver list.
              For example:
            </p>
            <pre className="docs-code">
              <code>{`images/drivers/add-driver.sh rtl8812au`}</code>
            </pre>

            <p>Build other configured targets by using their names:</p>
            <pre className="docs-code">
              <code>{`images/drivers/add-driver.sh rtl8821cu
images/drivers/add-driver.sh rtl88x2bu
images/drivers/add-driver.sh rtl8192eu
images/drivers/add-driver.sh rtl8814au`}</code>
            </pre>

            <h3>Step 4 — Add a new driver source</h3>
            <p>
              To add another driver, first find a maintained source repository
              for the exact chipset. Add its repository URL, branch, and source
              directory to:
            </p>
            <pre className="docs-code">
              <code>{`images/drivers/drivers.list`}</code>
            </pre>

            <p>Each entry follows this format:</p>
            <pre className="docs-code">
              <code>{`driver-name | git-repository-url | branch | source-subdirectory`}</code>
            </pre>

            <p>Then build it using the helper:</p>
            <pre className="docs-code">
              <code>{`images/drivers/add-driver.sh driver-name`}</code>
            </pre>

            <h3>Step 5 — Package and install</h3>
            <p>
              The helper compiles the module for ARM64, packages the resulting
              kernel module and any supplied firmware into a Debian package, and
              writes it under the build output's driver directory.
            </p>
            <pre className="docs-code">
              <code>{`find out -type f -name '*.deb'`}</code>
            </pre>

            <p>
              Transfer the generated package into the guest and install it using
              dpkg:
            </p>
            <pre className="docs-code">
              <code>{`sudo dpkg -i ./stryker-driver-NAME_VERSION_arm64.deb
sudo depmod -a
sudo modprobe DRIVER_NAME`}</code>
            </pre>

            <div className="docs-callout">
              <Shield size={17} />
              <p>
                <b>Kernel compatibility is mandatory.</b>
                <br />
                The module must be built against the exact guest kernel build
                tree. Matching only the kernel version string or using generic
                headers is not sufficient.
              </p>
            </div>

            <p>
              Driver source repositories have their own dependencies, kernel
              compatibility limits, and licenses. Review the source project's
              README and license before building or distributing a driver.
            </p>
          </>
        );

      case "usb":
        return (
          <>
            <h2>USB passthrough</h2>
            <p>
              XMR Lab transfers supported USB devices from Android into the
              Linux guest. The guest kernel then enumerates the device and binds
              the appropriate driver.
            </p>
            <ol className="docs-list ordered">
              <li>Connect a supported USB adapter using OTG.</li>
              <li>Grant XMR Lab the requested USB permission.</li>
              <li>Start the USB passthrough workflow.</li>
              <li>Check the guest terminal using lsusb and iw dev.</li>
            </ol>
            <p>
              A USB device can appear in lsusb even when no kernel driver is
              available. USB detection and Wi-Fi interface creation are two
              separate stages.
            </p>
          </>
        );

      case "troubleshooting":
        return (
          <>
            <h2>Troubleshooting</h2>
            <h3>Adapter appears in lsusb but no wlan interface</h3>
            <pre className="docs-code">
              <code>{`lsusb
iw dev
dmesg | grep -iE 'usb|firmware|wlan|wifi'`}</code>
            </pre>

            <p>
              Check whether the correct driver is enabled and whether the
              required firmware file exists.
            </p>

            <h3>Firmware loading failed</h3>
            <p>
              Install the firmware package corresponding to the chipset. Check
              the exact missing firmware filename in dmesg.
            </p>

            <h3>Invalid module format</h3>
            <p>
              The driver module was likely compiled for a different kernel build
              or configuration. Rebuild it using the matching guest kernel build
              tree.
            </p>

            <h3>USB device is not detected</h3>
            <p>
              Check OTG support, USB permissions, adapter power requirements,
              cable quality, and passthrough status.
            </p>

            <a
              className="button button-ghost docs-issue"
              href={`${GITHUB_URL}/issues`}
              target="_blank"
              rel="noreferrer"
            >
              <Github size={16} /> Report an issue
              <ArrowUpRight size={14} />
            </a>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <main className="docs-page container">
      <div className="docs-top">
        <SectionLabel>KNOWLEDGE BASE / 004</SectionLabel>
        <h1>
          Project <span className="cyan">documentation.</span>
        </h1>
        <p>Guides, compatibility information, and driver development.</p>
      </div>

      <div className="docs-layout">
        <aside className="docs-sidebar">
          <span>DOCUMENTATION</span>

          {topics.map((topic, index) => (
            <button
              key={topic.id}
              className={selected === topic.id ? "selected" : ""}
              onClick={() => setSelected(topic.id)}
            >
              <span>{topic.name}</span>
              <small>0{index + 1}</small>
            </button>
          ))}

          <div className="docs-help">
            <BookOpen size={18} />
            <b>Need more help?</b>
            <p>
              Visit the project repository for source code and issue tracking.
            </p>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer">
              GitHub repository <ArrowUpRight size={13} />
            </a>
          </div>
        </aside>

        <article className="docs-content">
          <div className="docs-breadcrumb">
            XMR LAB <span>/</span> DOCUMENTATION <span>/</span>
            {current.name.toUpperCase()}
          </div>

          <span className="docs-number">DOC / 0{currentIndex + 1}</span>

          {renderContent()}

          <div className="docs-bottom">
            <span>KEEP EXPLORING</span>
            <button onClick={() => setSelected(nextTopic.id)}>
              Next: {nextTopic.name}
              <ArrowRight size={15} />
            </button>
          </div>
        </article>
      </div>
    </main>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <Link to="/" className="brand">
          <span className="brand-mark">X</span>
          <span>
            XMR<span className="cyan"> LAB</span>
            <small>ANDROID LINUX ENVIRONMENT</small>
          </span>
        </Link>

        <p>
          Linux, in your pocket.
          <br />
          Built for curiosity and exploration.
        </p>

        <div className="footer-links">
          <Link to="/docs">Documentation</Link>
          <a href={GITHUB_URL} target="_blank" rel="noreferrer">
            GitHub <ArrowUpRight size={12} />
          </a>
          <a href={RELEASES_URL} target="_blank" rel="noreferrer">
            Releases <ArrowUpRight size={12} />
          </a>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} XMR LAB. OPEN-SOURCE PROJECT.</span>
        <span>
          DESIGNED IN THE MUX INTERFACE LANGUAGE <i />
        </span>
      </div>
    </footer>
  );
}

function Home() {
  return (
    <>
      <Hero />
      <Features />
      <Screenshots />
      <Download />
    </>
  );
}

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/docs" element={<Docs />} />
        <Route
          path="*"
          element={
            <main className="container not-found">
              <span>404 / NOT FOUND</span>
              <h1>Lost in the lab?</h1>
              <Link className="button button-primary" to="/">
                <ArrowLeft size={16} /> Back home
              </Link>
            </main>
          }
        />
      </Routes>
      <Footer />
    </>
  );
}
