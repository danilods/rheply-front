import type { Metadata } from "next";

interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: "website" | "article" | "profile";
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
}

const SITE_NAME = "Rheply";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://rheply.com";
const DEFAULT_IMAGE = "/og-image.png";

export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    image = DEFAULT_IMAGE,
    url,
    type = "website",
    publishedTime,
    modifiedTime,
    author,
    section,
    tags,
  } = config;

  const fullTitle = `${title} | ${SITE_NAME}`;
  const fullUrl = url ? `${SITE_URL}${url}` : SITE_URL;
  const fullImage = image.startsWith("http") ? image : `${SITE_URL}${image}`;

  return {
    title: fullTitle,
    description,
    keywords: keywords.join(", "),
    authors: author ? [{ name: author }] : undefined,
    openGraph: {
      title: fullTitle,
      description,
      url: fullUrl,
      siteName: SITE_NAME,
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "pt_BR",
      type,
      ...(type === "article" && {
        publishedTime,
        modifiedTime,
        authors: author ? [author] : undefined,
        section,
        tags,
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [fullImage],
    },
    alternates: {
      canonical: fullUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

interface JobPostingConfig {
  title: string;
  description: string;
  company: string | { name: string; sameAs?: string };
  location: string | { city?: string; state?: string; country?: string; remote?: boolean; hybrid?: boolean };
  type?: string;
  employmentType?: string;
  salary?: {
    min: number;
    max: number;
    currency?: string;
    period?: string;
  };
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  datePosted: string;
  validThrough?: string;
  skills?: string[];
  url?: string;
}

export function generateJobPostingSchema(job: JobPostingConfig) {
  const companyName = typeof job.company === 'string' ? job.company : job.company.name;
  const companySameAs = typeof job.company === 'string' ? SITE_URL : (job.company.sameAs || SITE_URL);
  const locationStr = typeof job.location === 'string'
    ? job.location
    : [job.location.city, job.location.state, job.location.country].filter(Boolean).join(', ');
  const empType = job.employmentType || job.type?.toUpperCase().replace("-", "_") || "FULL_TIME";
  const salaryMin = job.salary?.min || job.salaryMin;
  const salaryMax = job.salary?.max || job.salaryMax;
  const salaryCurrency = job.salary?.currency || job.currency || "BRL";
  const salaryPeriod = job.salary?.period || "MONTH";

  return {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    identifier: {
      "@type": "PropertyValue",
      name: companyName,
      value: job.title.toLowerCase().replace(/\s+/g, "-"),
    },
    datePosted: job.datePosted,
    validThrough: job.validThrough,
    employmentType: empType,
    hiringOrganization: {
      "@type": "Organization",
      name: companyName,
      sameAs: companySameAs,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: locationStr,
        addressCountry: "BR",
      },
    },
    ...(salaryMin && salaryMax && {
      baseSalary: {
        "@type": "MonetaryAmount",
        currency: salaryCurrency,
        value: {
          "@type": "QuantitativeValue",
          minValue: salaryMin,
          maxValue: salaryMax,
          unitText: salaryPeriod,
        },
      },
    }),
    ...(job.skills && job.skills.length > 0 && {
      skills: job.skills.join(", "),
    }),
    ...(job.url && {
      url: job.url,
    }),
  };
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    sameAs: [
      "https://linkedin.com/company/rheply",
      "https://twitter.com/rheply",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+55-11-9999-9999",
      contactType: "customer service",
      areaServed: "BR",
      availableLanguage: "Portuguese",
    },
  };
}

export function formatSalaryRange(min?: number, max?: number, currency = "BRL"): string {
  if (!min && !max) return "A combinar";

  const formatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  if (min && max) {
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  }
  if (min) {
    return `A partir de ${formatter.format(min)}`;
  }
  if (max) {
    return `Ate ${formatter.format(max)}`;
  }
  return "A combinar";
}

interface WebPageMetadataConfig {
  title: string;
  description: string;
  url?: string;
  keywords?: string[];
  image?: string;
}

export function generateWebPageMetadata(config: WebPageMetadataConfig): Metadata {
  const {
    title,
    description,
    url,
    keywords = [],
    image = DEFAULT_IMAGE,
  } = config;

  const fullTitle = `${title} | ${SITE_NAME}`;
  const fullUrl = url || SITE_URL;
  const fullImage = image.startsWith("http") ? image : `${SITE_URL}${image}`;

  return {
    title: fullTitle,
    description,
    keywords: keywords.join(", "),
    openGraph: {
      title: fullTitle,
      description,
      url: fullUrl,
      siteName: SITE_NAME,
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "pt_BR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [fullImage],
    },
    alternates: {
      canonical: fullUrl,
    },
  };
}
