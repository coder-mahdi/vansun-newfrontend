import Image from "next/image";

import {
  aboutJewelryBlock,
  aboutPiercingRoomBlock,
  aboutStudioBlocks,
  type AboutStudioBlock,
} from "@/data/about-page";
import { cn } from "@/lib/helpers";

function SplitBlock({ block }: { block: AboutStudioBlock }) {
  const reverse = block.imageSide === "left";
  const headingId = `about-studio-${block.id}`;

  return (
    <section
      className={cn(
        "about-studio",
        `about-studio--${block.tone}`,
        reverse && "about-studio--reverse"
      )}
      aria-labelledby={headingId}
    >
      <div className="about-studio__inner about-studio__inner--split">
        <div className="about-studio__copy">
          <h2 id={headingId} className="about-studio__title">
            {block.title}
          </h2>
          {block.paragraphs.map((p, i) => (
            <p key={`${block.id}-p-${i}`} className="about-studio__body">
              {p}
            </p>
          ))}
          {block.listIntro ? (
            <p className="about-studio__list-intro">{block.listIntro}</p>
          ) : null}
          {block.listItems && block.listItems.length > 0 ? (
            <ol className="about-studio__steps">
              {block.listItems.map((item, i) => (
                <li key={`${block.id}-li-${i}`} className="about-studio__step">
                  {item}
                </li>
              ))}
            </ol>
          ) : null}
          {(block.paragraphsAfterList ?? []).map((p, i) => (
            <p key={`${block.id}-pa-${i}`} className="about-studio__body">
              {p}
            </p>
          ))}
        </div>
        {block.image ? (
          <div className="about-studio__media">
            <div className="about-studio__frame">
              <Image
                src={block.image.src}
                alt={block.image.alt}
                fill
                className="about-studio__img"
                sizes="(min-width: 900px) 340px, 90vw"
              />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function StackBlock({ block }: { block: AboutStudioBlock }) {
  const headingId = `about-studio-${block.id}`;
  if (!block.image) return null;

  return (
    <section
      className={cn("about-studio", `about-studio--${block.tone}`)}
      aria-labelledby={headingId}
    >
      <div className="about-studio__inner about-studio__inner--stack">
        <div className="about-studio__stack-media">
          <div className="about-studio__frame about-studio__frame--wide">
            <Image
              src={block.image.src}
              alt={block.image.alt}
              fill
              className="about-studio__img"
              sizes="(min-width: 900px) 400px, 90vw"
            />
          </div>
        </div>
        <div className="about-studio__copy about-studio__copy--narrow">
          <h2 id={headingId} className="about-studio__title">
            {block.title}
          </h2>
          {block.paragraphs.map((p, i) => (
            <p key={`${block.id}-sp-${i}`} className="about-studio__body">
              {p}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

function TextOnlyBlock({
  id,
  tone,
  title,
  paragraphs,
}: {
  id: string;
  tone: "light" | "dark";
  title: string;
  paragraphs: string[];
}) {
  const headingId = `about-studio-${id}`;
  return (
    <section
      className={cn("about-studio", `about-studio--${tone}`, "about-studio--text-only")}
      aria-labelledby={headingId}
    >
      <div className="about-studio__inner about-studio__inner--text">
        <h2 id={headingId} className="about-studio__title">
          {title}
        </h2>
        {paragraphs.map((p, i) => (
          <p key={`${id}-t-${i}`} className="about-studio__body">
            {p}
          </p>
        ))}
      </div>
    </section>
  );
}

export function AboutStudioSections({ className }: { className?: string }) {
  return (
    <div className={cn("about-studio-wrap", className)}>
      {aboutStudioBlocks.map((block) => (
        <SplitBlock key={block.id} block={block} />
      ))}
      <TextOnlyBlock
        id={aboutJewelryBlock.id}
        tone={aboutJewelryBlock.tone}
        title={aboutJewelryBlock.title}
        paragraphs={aboutJewelryBlock.paragraphs}
      />
      <StackBlock block={aboutPiercingRoomBlock} />
    </div>
  );
}
