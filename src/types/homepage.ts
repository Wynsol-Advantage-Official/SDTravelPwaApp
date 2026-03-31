export interface HomepageCta {
  label: string;
  href: string;
}

export interface HeroMedia {
  src: string;
  poster: string;
  ariaLabel?: string;
}

export interface HeroContent {
  eyebrow: string;
  headline: string;
  subhead: string;
  primaryCta: HomepageCta;
  secondaryCta?: HomepageCta;
  fallbackNote?: string;
  video: HeroMedia;
}

export interface TestimonialItem {
  id: string;
  quote: string;
  name: string;
  role?: string;
  location?: string;
  tripType?: string;
}

export interface PartnerLogoItem {
  id: string;
  name: string;
  logoSrc?: string;
  alt: string;
  widthHint?: number;
  heightHint?: number;
  href?: string;
}

export interface HomepageContent {
  hero: HeroContent;
  testimonials: TestimonialItem[];
  partnerLogos: PartnerLogoItem[];
}
