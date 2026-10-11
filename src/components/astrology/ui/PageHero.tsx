import React from "react";

interface PageHeroProps {
  /** small uppercase line above the title */
  eyebrow: string;
  /** main heading */
  title: string;
  /** optional highlighted (gradient) part appended to the title */
  highlight?: string;
  /** one-line tagline */
  tagline?: string;
  /** longer description */
  description?: string;
  /** optional icon shown in the badge above the eyebrow */
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

/** Shared masthead for the inner pages (Porutham, Muhurtha, Horoscope, Baby names…). */
export const PageHero: React.FC<PageHeroProps> = ({ eyebrow, title, highlight, tagline, description, icon, children }) => (
  <section className="no-print relative pt-4 text-center">
    {icon && (
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl brand-gradient-bg text-white shadow-lift animate-scale-in">
        {icon}
      </div>
    )}
    <p className="story-eyebrow justify-center">{eyebrow}</p>
    <h1 className="story-subheading mt-2">
      {title} {highlight && <span className="brand-gradient-text">{highlight}</span>}
    </h1>
    {tagline && <p className="mt-3 text-base text-muted sm:text-lg">{tagline}</p>}
    {description && <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted">{description}</p>}
    {children}
  </section>
);

export default PageHero;
