import Image from "next/image";
import { CopyButton } from "@/components/CopyButton";
import { formatEventDate, formatEventTime, zonedTimeToUtc } from "@/lib/time";
import type { TemplateProps } from "../types";
import { Countdown } from "./Countdown";
import { CoverGate } from "./CoverGate";
import { Gallery } from "./Gallery";
import { RsvpSection } from "./RsvpSection";
import styles from "./classic.module.css";
import pattern from "./assets/minang-pattern.png";
import house from "./assets/rumah-gadang.png";
import leaves from "./assets/gold-leaves.png";
import flowers from "./assets/flowers.png";
import arch from "./assets/arch-frame.svg";
import curve from "./assets/curve.svg";

type Content = TemplateProps["content"];

function Person({ person, role }: { person: Content["bride"]; role: string }) {
  return (
    <div className={styles.person}>
      {person.photoUrl && (
        <div className={styles.portrait}>
          <img className={styles.archFrame} src={arch.src} alt="" />
          <div className={styles.archPhoto}>
            <Image src={person.photoUrl} alt={person.fullName} fill sizes="303px" className={styles.photo} />
          </div>
          <img className={styles.portraitLeaves} src={leaves.src} alt="" />
        </div>
      )}
      <h3>{person.fullName}</h3>
      <p>{role}{person.birthOrder && ` ${person.birthOrder}`} dari {person.parents}</p>
      {person.instagram && <a href={`https://instagram.com/${encodeURIComponent(person.instagram)}`} target="_blank" rel="noreferrer">@{person.instagram}</a>}
    </div>
  );
}

function EventCard({ title, event, timezone }: { title: string; event: Content["akad"]; timezone: string }) {
  return (
    <article className={styles.eventCard}>
      <img className={styles.eventFlowers} src={flowers.src} alt="" />
      <h3>{title}</h3>
      <p className={styles.eventDate}>{formatEventDate(event.startsAt, timezone)}</p>
      <p className={styles.eventVenue}>{event.venue}</p>
      <p className={styles.eventAddress}>{event.address}</p>
      <p className={styles.eventTime}>
        {formatEventTime(event.startsAt, timezone)}
        {event.endsAt && ` – ${formatEventTime(event.endsAt, timezone)}`}
      </p>
      {event.mapsUrl && <a className={styles.button} href={event.mapsUrl} target="_blank" rel="noreferrer">Maps</a>}
    </article>
  );
}

function Location({ event }: { event: Content["akad"] }) {
  // Maps belong to the event content, never to a static screenshot from another invitation.
  const map = `https://maps.google.com/maps?q=${encodeURIComponent(`${event.venue}, ${event.address}`)}&output=embed`;
  return (
    <figure className={styles.location}>
      {event.mapImageUrl ? (
        <a href={event.mapsUrl || map} target="_blank" rel="noreferrer">
          <Image src={event.mapImageUrl} alt={`Peta lokasi ${event.venue}`} width={304} height={247} sizes="304px" className={styles.mapImage} />
        </a>
      ) : <iframe src={map} title={`Peta lokasi ${event.venue}`} loading="lazy" referrerPolicy="no-referrer" />}
      <figcaption><strong>{event.venue}</strong><p>{event.address}</p></figcaption>
    </figure>
  );
}

export function ClassicTemplate({ slug, content, guest, token, preview }: TemplateProps) {
  const coupleName = `${content.bride.nickname} & ${content.groom.nickname}`;
  const guestName = guest ? [guest.name, guest.partnerName].filter(Boolean).join(" & ") : (content.recipientName || null);
  return (
    <CoverGate
      coupleName={coupleName}
      title={content.coverTitle || "Maimbau Baralek"}
      guestName={guestName}
      musicUrl={content.musicUrl}
      coverImage={<Image src={content.coverImageUrl} alt="" fill priority sizes="(max-width: 390px) 100vw, 390px" className={styles.photo} />}
      portraitImage={<Image src={content.coverPortraitUrl || content.coverImageUrl} alt={coupleName} fill priority sizes="256px" className={styles.photo} />}
    >
      <div className={styles.details}>
        <section className={styles.hero} data-section="hero">
          <div className={styles.heroPattern}><img src={pattern.src} alt="" /></div>
          <img className={styles.heroHouse} src={house.src} alt="" />
          <p className={styles.heroKicker}>PERNIKAHAN</p>
          <h2 className={styles.heroNames}>{content.bride.nickname}<br />&amp;<br />{content.groom.nickname}</h2>
          <p className={styles.heroDate}>{formatEventDate(content.resepsi.startsAt, content.timezone)}</p>
          <Countdown target={zonedTimeToUtc(content.resepsi.startsAt, content.timezone).getTime()} />
        </section>

        {content.quote.text && (
          <section className={styles.quote} data-section="quote">
            <Image src={content.quote.imageUrl || content.coverImageUrl} alt="" fill sizes="390px" className={styles.photo} />
            <img className={styles.quoteTopCurve} src={curve.src} alt="" />
            <img className={styles.quoteHouse} src={house.src} alt="" />
            <blockquote className={styles.quoteCard}>
              <p>“{content.quote.text}”</p>
              {content.quote.source && <cite>{content.quote.source}</cite>}
            </blockquote>
            <img className={styles.quoteLeavesTop} src={leaves.src} alt="" />
            <img className={styles.quoteLeavesBottom} src={leaves.src} alt="" />
            <img className={styles.quoteBottomCurve} src={curve.src} alt="" />
          </section>
        )}

        <section className={styles.couple} data-section="couple">
          <h2>Assalamualaikum wr. wb.</h2>
          <p className={styles.coupleIntro}>Dengan memohon rahmat dan ridho Allah SWT, kami dengan penuh kebahagiaan mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberikan doa restu pada acara pernikahan kami.</p>
          <Person person={content.bride} role="Putri" />
          <p className={styles.ampersand}>&amp;</p>
          <Person person={content.groom} role="Putra" />
        </section>

        <section className={styles.events} data-section="event">
          <div className={styles.eventPattern}><img src={pattern.src} alt="" /></div>
          <h2>Acara Pernikahan</h2>
          <p className={styles.eventIntro}>Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu untuk dapat hadir pada acara pernikahan kami yang insyaAllah akan dilaksanakan pada:</p>
          <EventCard title="Akad" event={content.akad} timezone={content.timezone} />
          <EventCard title="Resepsi" event={content.resepsi} timezone={content.timezone} />
        </section>

        <section className={styles.locations} data-section="location" aria-label="Lokasi acara">
          <Location event={content.akad} />
          <Location event={content.resepsi} />
        </section>

        {content.galleryUrls.length > 0 && (
          <section className={styles.gallerySection} data-section="gallery">
            <h2>Momen Kami</h2>
            <Gallery urls={content.galleryUrls} coupleName={coupleName} />
          </section>
        )}

        <section className={styles.rsvpSection} data-section="rsvp">
          <p className={styles.rsvpIntro}>Kami mohon kesediaan Bapak/Ibu/Saudara/i untuk mengisi konfirmasi kehadiran di bawah ini.</p>
          <RsvpSection slug={slug} token={token} guest={guest} preview={preview} />
        </section>

        {content.gifts.length > 0 && (
          <section className={styles.gifts} data-section="gift">
            {content.gifts.map((gift) => (
              <div className={styles.giftCard} key={`${gift.bank}-${gift.accountNumber}`}>
                <h2>Tanda Kasih</h2>
                <p>Doa dan kehadiran Anda merupakan hadiah terindah bagi kami. Bagi yang ingin berbagi tanda kasih, kami menyediakan informasi rekening di bawah ini.</p>
                <p className={styles.bankName}>{gift.bank}</p>
                <strong className={styles.accountNumber}>{gift.accountNumber}</strong>
                <p className={styles.accountName}>{gift.accountName}</p>
                <CopyButton value={gift.accountNumber} label="Salin Nomor Rekening" className={styles.button} />
              </div>
            ))}
          </section>
        )}
      </div>
    </CoverGate>
  );
}
