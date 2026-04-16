import Image from "next/image";
import Link from "next/link";

import { homeServices } from "@/data/home-services";
import { cn } from "@/lib/helpers";

export function ServicesSection({
  className,
  serviceImages,
}: {
  className?: string;
  serviceImages: {
    tattoo: { url: string; alt: string };
    piercing: { url: string; alt: string };
  };
}) {
  const items = homeServices.map((item) => {
    const key = item.title.toLowerCase() === "tattoo" ? "tattoo" : "piercing";
    const cms = serviceImages[key];
    return {
      ...item,
      imageUrl: cms.url,
      imageAlt: cms.alt,
    };
  });

  return (
    <section
      id="services"
      className={cn("services", className)}
      aria-labelledby="services-heading"
    >
      <h2 id="services-heading">Services</h2>
      <div className="services-items-container">
        {items.map((item) => (
          <article key={item.bookHref} className="services-item">
            <h3>{item.title}</h3>
            <Image
              className="services-image"
              src={item.imageUrl}
              alt={item.imageAlt}
              width={150}
              height={150}
              sizes="(max-width: 480px) 110px, (max-width: 768px) 125px, (max-width: 1023px) 135px, 150px"
            />
            <p>{item.description}</p>
            <div className="button-group">
              <Link className="btn-book" href={item.bookHref}>
                {item.bookLabel}
              </Link>
              {item.galleryLinks?.map((g) => (
                <Link key={g.href} className="btn-gallery" href={g.href}>
                  {g.label}
                </Link>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
