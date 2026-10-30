import Image from "next/image";
import { CopyButton } from "@/components/CopyButton";
import { formatEventDate, formatEventTime, zonedTimeToUtc } from "@/lib/time";
import type { TemplateProps } from "../types";
import { Countdown } from "./Countdown";
import { CoverGate } from "./CoverGate";
import { RsvpForm } from "./RsvpForm";

type Content = TemplateProps["content"];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="font-serif text-3xl text-gold">{children}</h2>;
}

function EventCard({ title, event, timezone }: { title: string; event: Content["akad"]; timezone: string }) {
  const time = event.endsAt
    ? `${formatEventTime(event.startsAt, timezone)} – ${formatEventTime(event.endsAt, timezone)}`
    : `${formatEventTime(event.startsAt, timezone)} – selesai`;

  return (
    <div className="space-y-2 rounded-2xl bg-white/70 p-6">
      <h3 className="font-serif text-2xl">{title}</h3>
      <p className="font-medium">{formatEventDate(event.startsAt, timezone)}</p>
      <p className="text-sm">{time}</p>
      <p className="pt-2 font-medium">{event.venue}</p>
      <p className="text-sm text-neutral-600">{event.address}</p>
      {event.mapsUrl && (
        <a
          href={event.mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block rounded-full border border-ink px-4 py-1.5 text-sm"
        >
          Buka Google Maps
        </a>
      )}
    </div>
  );
}

function Person({ person, role }: { person: Content["groom"]; role: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      {person.photoUrl && (
        <div className="relative size-40 overflow-hidden rounded-full border-4 border-white shadow">
          <Image src={person.photoUrl} alt={person.fullName} fill sizes="160px" className="object-cover" />
        </div>
      )}
      <h3 className="font-serif text-3xl">{person.fullName}</h3>
      <p className="text-sm text-neutral-600">
        {role} dari {person.parents}
      </p>
      {person.instagram && (
        <a href={`https://instagram.com/${person.instagram}`} target="_blank" rel="noreferrer" className="text-sm text-gold">
          @{person.instagram}
        </a>
      )}
    </div>
  );
}

export function ClassicTemplate({ content, guest, token, wishes, preview }: TemplateProps) {
  const coupleName = `${content.groom.nickname} & ${content.bride.nickname}`;
  const guestName = guest ? [guest.name, guest.partnerName].filter(Boolean).join(" & ") : null;
  const countdownTarget = zonedTimeToUtc(content.akad.startsAt, content.timezone).getTime();
  const mapsEmbed = `https://maps.google.com/maps?q=${encodeURIComponent(content.resepsi.address)}&output=embed`;

  return (
    <CoverGate
      coupleName={coupleName}
      // Content published before these fields existed has no key at all, hence `||`.
      title={content.coverTitle || "Maimbau Baralek"}
      guestName={guestName}
      musicUrl={content.musicUrl}
      coverImage={<Image src={content.coverImageUrl} alt="" fill priority sizes="100vw" className="object-cover" />}
      portraitImage={
        <Image src={content.coverPortraitUrl || content.coverImageUrl} alt="" fill priority sizes="256px" className="object-cover" />
      }
    >
      <main className="mx-auto max-w-md bg-ivory text-center text-ink">
        <section className="relative flex min-h-dvh flex-col items-center justify-end overflow-hidden pb-16">
          <Image src={content.coverImageUrl} alt={coupleName} fill sizes="(max-width: 448px) 100vw, 448px" className="object-cover" />
          <div className="absolute inset-0 bg-linear-to-t from-ivory via-ivory/40 to-transparent" />
          <div className="relative z-10 px-6">
            <p className="text-xs tracking-[0.3em] uppercase">The Wedding of</p>
            <h1 className="mt-2 font-serif text-5xl">{coupleName}</h1>
            <p className="mt-3">{formatEventDate(content.akad.startsAt, content.timezone)}</p>
          </div>
        </section>

        <section className="space-y-6 px-6 py-12">
          <SectionTitle>Menuju Hari Bahagia</SectionTitle>
          <Countdown target={countdownTarget} />
        </section>

        {content.quote.text && (
          <section className="px-8 py-12">
            <p className="font-serif text-xl leading-relaxed italic">“{content.quote.text}”</p>
            {content.quote.source && <p className="mt-4 text-sm text-neutral-600">{content.quote.source}</p>}
          </section>
        )}

        <section className="space-y-10 bg-sand/50 px-6 py-14">
          <SectionTitle>Mempelai</SectionTitle>
          <Person person={content.groom} role="Putra" />
          <p className="font-serif text-4xl text-gold">&</p>
          <Person person={content.bride} role="Putri" />
        </section>

        <section className="space-y-6 px-6 py-14">
          <SectionTitle>Rangkaian Acara</SectionTitle>
          <EventCard title="Akad" event={content.akad} timezone={content.timezone} />
          <EventCard title="Resepsi" event={content.resepsi} timezone={content.timezone} />
        </section>

        <section className="space-y-4 px-6 pb-14">
          <SectionTitle>Lokasi</SectionTitle>
          <iframe
            src={mapsEmbed}
            title={`Peta lokasi ${content.resepsi.venue}`}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="h-64 w-full rounded-2xl border-0"
          />
        </section>

        {content.galleryUrls.length > 0 && (
          <section className="space-y-6 bg-sand/50 px-6 py-14">
            <SectionTitle>Galeri</SectionTitle>
            <div className="grid grid-cols-2 gap-2">
              {content.galleryUrls.map((url, i) => (
                <div key={`${i}-${url}`} className="relative aspect-square overflow-hidden rounded-lg">
                  <Image src={url} alt={`Foto ${i + 1}`} fill sizes="(max-width: 448px) 50vw, 224px" className="object-cover" />
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="space-y-6 px-6 py-14">
          <SectionTitle>Konfirmasi Kehadiran</SectionTitle>
          {preview ? (
            <p className="text-sm text-neutral-600">Form RSVP tidak aktif di mode preview.</p>
          ) : guest && token ? (
            <RsvpForm token={token} guest={guest} />
          ) : (
            <p className="text-sm text-neutral-600">Konfirmasi kehadiran tersedia melalui link undangan personal.</p>
          )}
        </section>

        <section className="space-y-6 bg-sand/50 px-6 py-14">
          <SectionTitle>Ucapan & Doa</SectionTitle>
          {wishes.length === 0 ? (
            <p className="text-sm text-neutral-600">Belum ada ucapan.</p>
          ) : (
            <ul className="max-h-96 space-y-3 overflow-y-auto text-left">
              {wishes.map((w) => (
                <li key={w.id} className="rounded-lg bg-white/80 p-4">
                  <p className="text-sm font-semibold">{[w.name, w.partnerName].filter(Boolean).join(" & ")}</p>
                  <p className="mt-1 text-sm whitespace-pre-line">{w.wish}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {content.gifts.length > 0 && (
          <section className="space-y-6 px-6 py-14">
            <SectionTitle>Tanda Kasih</SectionTitle>
            <p className="text-sm text-neutral-600">Doa restu Anda adalah hadiah terindah. Jika ingin memberi tanda kasih:</p>
            {content.gifts.map((g) => (
              <div key={`${g.bank}-${g.accountNumber}`} className="space-y-1 rounded-2xl bg-white/70 p-5">
                <p className="font-semibold">{g.bank}</p>
                <p className="font-mono text-lg">{g.accountNumber}</p>
                <p className="text-sm">a.n. {g.accountName}</p>
                <CopyButton value={g.accountNumber} label="Salin Nomor" className="mt-2 rounded-full border border-ink px-4 py-1.5 text-sm" />
              </div>
            ))}
          </section>
        )}

        <footer className="px-6 py-10 font-serif text-2xl">{coupleName}</footer>
      </main>
    </CoverGate>
  );
}
