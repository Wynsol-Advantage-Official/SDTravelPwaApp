import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, Calendar } from "lucide-react";
import { Reveal } from "@/components/motion";
import { getActiveArticles } from "@/lib/services/articles.service";
import { formatArticleDate, getArticleHref } from "@/lib/rules/articles-rules";
import type { Article } from "@/types/article";

// ---------------------------------------------------------------------------
// LuxuryInsights — Server Component
// ---------------------------------------------------------------------------
// Fetches active articles from the Wix CMS "Articles" collection and renders
// them in a 2-column editorial layout: article preview cards on the left,
// brand editorial panel on the right.
// Renders nothing when there are no active articles.
// ---------------------------------------------------------------------------

/* ------------------------------------------------------------------ */
/*  Article preview card                                               */
/* ------------------------------------------------------------------ */

function ArticlePreviewCard({ article }: { article: Article }) {
  const href = getArticleHref(article);
  const date = formatArticleDate(article.publishedDate);

  return (
    <Link
      href={href}
      className="group flex gap-4 rounded-[14px] border border-khaki/30 bg-white p-3 transition-[transform,border-color,box-shadow] duration-220 ease-out hover:-translate-y-0.5 hover:border-ocean/30 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-chill dark:border-white/10 dark:bg-ocean-card dark:hover:border-blue-chill/30"
    >
      {/* Cover image — fixed square */}
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[10px]">
        <Image
          src={article.cover.src}
          alt={article.cover.alt || article.title}
          fill
          sizes="96px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-col justify-center gap-1.5">
        {/* Category */}
        {article.category && (
          <p className="font-sans text-[9px] uppercase tracking-widest text-ocean dark:text-blue-chill">
            {article.category}
          </p>
        )}

        {/* Title */}
        <h3 className="line-clamp-2 font-sans text-[14px] font-semibold leading-snug text-ocean-deep dark:text-white">
          {article.title}
        </h3>

        {/* Meta row */}
        <div className="flex items-center gap-3">
          {date && (
            <span className="flex items-center gap-1 font-sans text-[10px] text-ocean-deep/45 dark:text-white/45">
              <Calendar size={9} aria-hidden="true" />
              {date}
            </span>
          )}
          {article.readMinutes && (
            <span className="flex items-center gap-1 font-sans text-[10px] text-ocean-deep/45 dark:text-white/45">
              <Clock size={9} aria-hidden="true" />
              {article.readMinutes} min read
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Featured (large) article card                                      */
/* ------------------------------------------------------------------ */

function ArticleFeaturedCard({ article }: { article: Article }) {
  const href = getArticleHref(article);
  const date = formatArticleDate(article.publishedDate);

  return (
    <Link
      href={href}
      className="group relative flex h-70 flex-col justify-end overflow-hidden rounded-[14px] border border-khaki/30 bg-white transition-[transform,border-color,box-shadow] duration-220 ease-out hover:-translate-y-0.5 hover:border-ocean/30 hover:shadow-[0_8px_28px_rgba(0,0,0,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-chill dark:border-white/10 dark:bg-ocean-card dark:hover:border-blue-chill/30"
    >
      {/* Cover image */}
      <Image
        src={article.cover.src}
        alt={article.cover.alt || article.title}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Gradient scrim */}
      <div
        className="absolute inset-0 bg-linear-to-t from-ocean-deep/85 via-ocean-deep/25 to-transparent"
        aria-hidden="true"
      />

      {/* Content overlay */}
      <div className="relative z-10 p-4">
        {article.category && (
          <p className="mb-1.5 font-sans text-[9px] uppercase tracking-widest text-blue-chill-300">
            {article.category}
          </p>
        )}
        <h3 className="line-clamp-2 font-sans text-[18px] font-bold leading-snug text-white">
          {article.title}
        </h3>
        <div className="mt-2 flex items-center gap-3">
          {date && (
            <span className="flex items-center gap-1 font-sans text-[10px] text-white/55">
              <Calendar size={9} aria-hidden="true" />
              {date}
            </span>
          )}
          {article.readMinutes && (
            <span className="flex items-center gap-1 font-sans text-[10px] text-white/55">
              <Clock size={9} aria-hidden="true" />
              {article.readMinutes} min read
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  LuxuryInsights section (async server component)                   */
/* ------------------------------------------------------------------ */

export async function LuxuryInsights() {
  const articles = await getActiveArticles(6);

  if (articles.length === 0) return null;

  const [featured, ...rest] = articles;
  const previews = rest.slice(0, 3);

  return (
    <section aria-labelledby="luxury-insights-heading" className="mt-6">
      {/* ── Section header ─────────────────────────────────────────── */}
      <Reveal>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="font-sans text-[9px] uppercase tracking-widest text-ocean dark:text-blue-chill">
              Travel Insights
            </p>
            <h2
              id="luxury-insights-heading"
              className="mt-1 font-sans text-[22px] text-ocean-deep transition-colors duration-300 dark:text-white"
            >
              From the{" "}
              <em className="italic text-ocean dark:text-blue-chill-300">Blog</em>
            </h2>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 font-sans text-[12px] font-semibold uppercase tracking-widest text-ocean transition-colors hover:text-ocean-deep dark:text-blue-chill-300 dark:hover:text-blue-chill"
          >
            All Stories{" "}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </Reveal>

      {/* ── 2-column editorial layout ──────────────────────────────── */}
      {/*
          Desktop: left = featured large card + preview list
                   right = editorial panel (heading + narrative + CTA)
          Mobile:  editorial panel first, then cards stacked below
      */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_380px]">

        {/* ── Left: article cards ──────────────────────────────────── */}
        <div className="order-2 flex flex-col gap-3 lg:order-1">
          {featured && <ArticleFeaturedCard article={featured} />}
          {previews.length > 0 && (
            <div className="flex flex-col gap-3">
              {previews.map((article) => (
                <ArticlePreviewCard key={article._id} article={article} />
              ))}
            </div>
          )}
        </div>

        {/* ── Right: editorial panel ───────────────────────────────── */}
        <div className="order-1 flex flex-col justify-center lg:order-2">
          <Reveal>
            <div className="rounded-[14px] border border-khaki/30 bg-white p-6 dark:border-white/10 dark:bg-ocean-card lg:sticky lg:top-24">
              {/* Eyebrow */}
              <p className="font-sans text-[9px] uppercase tracking-widest text-ocean dark:text-blue-chill">
                Caribbean Insider
              </p>

              {/* Heading */}
              <h3 className="mt-2 font-sans text-[24px] font-bold leading-tight text-ocean-deep dark:text-white">
                An Insider's Guide to the{" "}
                <em className="italic text-ocean dark:text-blue-chill-300">
                  Caribbean
                </em>
              </h3>

              {/* Narrative */}
              <p className="mt-4 font-sans text-[14px] leading-relaxed text-ocean-deep/65 dark:text-white/65">
                Planning your next adventure? The Caribbean experience can be
                whatever you want it to be — from the rhythm of Jamaica to the
                romance of Barbados. Come and lose yourself in the stories
                written by travellers who've been there.
              </p>

              {/* CTA */}
              <Link
                href="/blog"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-ocean-deep px-5 py-3 font-sans text-[11px] font-bold uppercase tracking-widest text-white transition-[background-color,transform] duration-220 ease-out hover:-translate-y-0.5 hover:bg-ocean focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean dark:bg-ocean dark:hover:bg-blue-chill dark:hover:text-ocean-deep"
              >
                Explore All Posts
                <ArrowRight size={13} aria-hidden="true" />
              </Link>
            </div>
          </Reveal>
        </div>

      </div>
    </section>
  );
}
