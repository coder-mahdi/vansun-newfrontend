import Image from "next/image";
import Link from "next/link";

import { homeServices } from "@/data/home-services";
import { cn } from "@/lib/helpers";

export function ServicesSection({ className }: { className?: string }) {
  return (
    <section
      className={cn("services", className)}
      aria-labelledby="services-heading"
    >
      <h2 id="services-heading">Services</h2>
      <div className="services-items-container">
        {homeServices.map((item) => (
          <article key={item.bookHref} className="services-item">
            <h3>{item.title}</h3>
            <Image
              className="services-image"
              src={item.imageUrl}
              alt={item.imageAlt}
              width={200}
              height={200}
              sizes="(max-width: 480px) 140px, (max-width: 768px) 160px, (max-width: 1023px) 180px, 200px"
            />
            <p>{item.description}</p>
            <div className="button-group">
              <Link className="btn-book" href={item.bookHref}>
                {item.bookLabel}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
