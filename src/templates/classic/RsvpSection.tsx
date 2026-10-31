"use client";

import { useState } from "react";
import type { TemplateGuest } from "../types";
import { RsvpForm } from "./RsvpForm";
import { WishList } from "./WishList";
import styles from "./classic.module.css";

export function RsvpSection({ slug, token, guest, preview }: {
  slug: string;
  token: string | null;
  guest: TemplateGuest | null;
  preview: boolean;
}) {
  const [refreshKey, setRefreshKey] = useState(0);
  return (
    <>
      <div className={styles.rsvpCard}>
        <h2>Konfirmasi Kehadiran</h2>
        {preview ? (
          <p>Form RSVP tidak aktif di mode preview.</p>
        ) : (
          <RsvpForm
            key={token ?? slug}
            slug={slug}
            token={token}
            guest={guest}
            onSaved={() => setRefreshKey((key) => key + 1)}
          />
        )}
      </div>
      {!preview && <WishList slug={slug} refreshKey={refreshKey} />}
    </>
  );
}
