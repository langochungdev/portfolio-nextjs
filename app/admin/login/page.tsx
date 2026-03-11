"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useMockAuth } from "@/app/admin/_components/MockAuthProvider";
import { useRouter } from "next/navigation";
import { useDictionary } from "@/app/[lang]/_shared/DictionaryProvider";
import styles from "@/app/style/admin/login.module.css";

export default function AdminLoginPage() {
  const { dictionary: dict } = useDictionary();
  const { user, login } = useMockAuth();
  const router = useRouter();
  const t = dict.admin.login;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (user) {
      router.replace("/admin");
    }
  }, [user, router]);

  if (user) {
    return null;
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    login(username.trim());
    router.replace("/admin");
  };

  return (
    <div className={styles.loginPage}>
      <form className={styles.loginCard} onSubmit={handleSubmit}>
        <h1 className={styles.loginTitle}>{t.title}</h1>

        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="username">{t.username}</label>
          <input
            id="username"
            className={styles.fieldInput}
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
            autoFocus
          />
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="password">{t.password}</label>
          <input
            id="password"
            className={styles.fieldInput}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        <button className={styles.submitBtn} type="submit">
          {t.submit}
        </button>
      </form>
    </div>
  );
}
