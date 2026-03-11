"use client";

import { useEffect, useState } from "react";
import { generateFingerprint } from "@/lib/visitor/fingerprint";
import {
  getOrCreateVisitorId,
  getStoredVisitorId,
  getDeviceMetadata,
  type VisitorIdentity,
} from "@/lib/visitor/identity";
import styles from "./test.module.css";

interface TestResult {
  label: string;
  value: string;
  status: "pass" | "fail" | "info";
}

export default function FingerprintTestPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runTests();
  }, []);

  async function runTests() {
    const tests: TestResult[] = [];

    tests.push({
      label: "Environment",
      value: isPrivateMode() ? "Private / Incognito" : "Normal browsing",
      status: "info",
    });

    const fp1 = await generateFingerprint();
    tests.push({
      label: "Fingerprint #1",
      value: fp1,
      status: "info",
    });

    const fp2 = await generateFingerprint();
    tests.push({
      label: "Fingerprint #2 (consistency)",
      value: fp2,
      status: fp1 === fp2 ? "pass" : "fail",
    });

    tests.push({
      label: "Fingerprint stable?",
      value: fp1 === fp2 ? "YES - identical across calls" : "NO - mismatch!",
      status: fp1 === fp2 ? "pass" : "fail",
    });

    const cachedId = getStoredVisitorId();
    tests.push({
      label: "Cached visitor ID",
      value: cachedId || "(none — first visit or storage cleared)",
      status: cachedId ? "pass" : "info",
    });

    let identity: VisitorIdentity;
    try {
      identity = await getOrCreateVisitorId();
      tests.push({
        label: "Visitor ID",
        value: identity.visitorId,
        status: "pass",
      });
      tests.push({
        label: "Recovered by fingerprint?",
        value: identity.isRecovered ? "YES — recovered from Firestore" : "NO — from storage or new",
        status: identity.isRecovered ? "pass" : "info",
      });
    } catch (e) {
      tests.push({
        label: "Visitor ID",
        value: `Error: ${e instanceof Error ? e.message : "unknown"}`,
        status: "fail",
      });
    }

    const meta = getDeviceMetadata();
    tests.push(
      { label: "OS", value: meta.os, status: "info" },
      { label: "Browser", value: meta.browser, status: "info" },
      { label: "Device", value: meta.device, status: "info" },
    );

    tests.push({
      label: "localStorage available",
      value: String(testLocalStorage()),
      status: testLocalStorage() ? "pass" : "fail",
    });

    tests.push({
      label: "Cookies enabled",
      value: String(navigator.cookieEnabled),
      status: navigator.cookieEnabled ? "pass" : "fail",
    });

    tests.push({
      label: "Screen",
      value: `${screen.width}x${screen.height} @${devicePixelRatio}x, ${screen.colorDepth}bit`,
      status: "info",
    });

    tests.push({
      label: "Timezone",
      value: Intl.DateTimeFormat().resolvedOptions().timeZone,
      status: "info",
    });

    tests.push({
      label: "Hardware Concurrency",
      value: String(navigator.hardwareConcurrency || "unknown"),
      status: "info",
    });

    setResults(tests);
    setLoading(false);
  }

  function handleClearStorage() {
    try { localStorage.removeItem("visitor_id"); } catch { /* */ }
    try { localStorage.removeItem("visitor_fp"); } catch { /* */ }
    document.cookie = "visitor_id=;path=/;max-age=0";
    document.cookie = "visitor_fp=;path=/;max-age=0";
    window.location.reload();
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Fingerprint Test</h1>
      <p className={styles.subtitle}>
        Copy the Fingerprint and Visitor ID values, then open this page in a
        Private/Incognito window to verify they match.
      </p>

      {loading ? (
        <div className={styles.loading}>Running tests...</div>
      ) : (
        <>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Test</th>
                <th>Result</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} className={styles[r.status]}>
                  <td>{r.label}</td>
                  <td className={styles.value}>{r.value}</td>
                  <td>{r.status.toUpperCase()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className={styles.actions}>
            <button className={styles.clearBtn} onClick={handleClearStorage}>
              Clear Storage & Reload
            </button>
            <p className={styles.hint}>
              After clearing, the fingerprint should recover your Visitor ID
              from Firestore (if a conversation doc exists).
            </p>
          </div>

          <div className={styles.instructions}>
            <h2>How to test Private/Incognito</h2>
            <ol>
              <li>Note the <strong>Fingerprint</strong> and <strong>Visitor ID</strong> above</li>
              <li>Open a Private/Incognito window (Ctrl+Shift+N in Chrome)</li>
              <li>Navigate to this same URL</li>
              <li>Compare results:</li>
            </ol>
            <ul>
              <li><strong>Fingerprint</strong> should be identical (same hardware/browser)</li>
              <li><strong>Visitor ID</strong> will be recovered IF a conversation doc was saved to Firestore</li>
              <li>If Firestore is not set up, a new Visitor ID will be generated (expected)</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

function isPrivateMode(): boolean {
  try {
    localStorage.setItem("__pm_test__", "1");
    localStorage.removeItem("__pm_test__");
    return false;
  } catch {
    return true;
  }
}

function testLocalStorage(): boolean {
  try {
    localStorage.setItem("__test__", "1");
    localStorage.removeItem("__test__");
    return true;
  } catch {
    return false;
  }
}
