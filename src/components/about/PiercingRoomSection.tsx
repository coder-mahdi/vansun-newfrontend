import Image from "next/image";

import {
  piercingRoomBody,
  piercingRoomImageUrls,
  piercingRoomTitle,
} from "@/data/about-page";
import { cn } from "@/lib/helpers";

export function PiercingRoomSection({ className }: { className?: string }) {
  return (
    <section
      className={cn("piercing-room-section", className)}
      aria-labelledby="piercing-room-heading"
    >
      <div className="piercing-room-section__inner">
        <div className="piercing-room-section__copy">
          <h2 id="piercing-room-heading" className="piercing-room-section__title">
            {piercingRoomTitle}
          </h2>
          {piercingRoomBody.map((p, i) => (
            <p key={`piercing-room-body-${i}`} className="piercing-room-section__body">
              {p}
            </p>
          ))}
        </div>
        <ul className="piercing-room-section__grid">
          {piercingRoomImageUrls.map((src, i) => (
            <li key={`piercing-room-${i}`} className="piercing-room-section__cell">
              <div className="piercing-room-section__frame">
                <Image
                  src={src}
                  alt={`${piercingRoomTitle} — photo ${i + 1}`}
                  fill
                  className="piercing-room-section__img"
                  sizes="(min-width: 1023px) 22vw, (min-width: 600px) 45vw, 100vw"
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
