'use client';

import Link from 'next/link';
import { useEffect, useState, type AnchorHTMLAttributes, type ReactNode } from 'react';
import analytics from '@/src/lib/analytics';
import type { BlogCategory } from '@/constants/content';

type BlogLinkEvent = 'blog_article_cta_clicked' | 'blog_article_transition_clicked';

interface BlogTrackedLinkProps {
  articleSlug: string;
  category: BlogCategory;
  children: ReactNode;
  className: string;
  ctaRole: 'primary' | 'secondary' | 'contextual';
  eventName?: BlogLinkEvent;
  href: string;
  rel?: string;
  source: 'article_chrome' | 'evidence_panel' | 'hero' | 'next_step_cards' | 'related_articles';
  target?: AnchorHTMLAttributes<HTMLAnchorElement>['target'];
}

export const BLOG_ARTICLE_ROUTE_ACTION_STATUS_ID = 'blog-article-route-action-status';
const BLOG_ARTICLE_ROUTE_ACTION_STATUS_LABEL = 'Blog article route action status';
const BLOG_ARTICLE_ROUTE_ACTION_STATUS_EVENT = 'blog-article-route-action-status-update';
export const BLOG_ARTICLE_ROUTE_ACTION_READY_STATUS =
  'Blog article route handoffs are ready. Use condition guides, product hubs, protocols, research, and contact links for next steps.';

function getBlogArticleRouteActionStatusMessage({
  href,
  source,
}: Pick<BlogTrackedLinkProps, 'href' | 'source'>) {
  if (href === '/conditions' || href.startsWith('/conditions/')) {
    return 'Opening condition guide from the blog article route.';
  }

  if (href === '/product' || href.startsWith('/product/')) {
    return 'Opening product hub from the blog article route.';
  }

  if (href === '/protocols' || href.startsWith('/protocols/')) {
    return 'Opening protocol guide from the blog article route.';
  }

  if (href === '/research') {
    return 'Opening research hub from the blog article route.';
  }

  if (href === '/contact') {
    return 'Opening Contact Hylono from the blog article route.';
  }

  if (href === '/blog') {
    return 'Opening blog index from the blog article route.';
  }

  if (href.startsWith('/blog/')) {
    return 'Opening related article from the blog article route.';
  }

  if (href.startsWith('http://') || href.startsWith('https://')) {
    return 'Opening cited source record from the blog article route.';
  }

  return `Opening ${source.replaceAll('_', ' ')} from the blog article route.`;
}

function announceBlogArticleRouteActionStatus(message: string) {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent<{ message: string }>(BLOG_ARTICLE_ROUTE_ACTION_STATUS_EVENT, {
      detail: { message },
    })
  );
}

export function BlogArticleRouteActionStatus() {
  const [statusMessage, setStatusMessage] = useState(BLOG_ARTICLE_ROUTE_ACTION_READY_STATUS);

  useEffect(() => {
    const handleStatusUpdate = (event: Event) => {
      const nextMessage = (event as CustomEvent<{ message?: string }>).detail?.message;

      if (nextMessage) {
        setStatusMessage(nextMessage);
      }
    };

    window.addEventListener(BLOG_ARTICLE_ROUTE_ACTION_STATUS_EVENT, handleStatusUpdate);

    return () => {
      window.removeEventListener(BLOG_ARTICLE_ROUTE_ACTION_STATUS_EVENT, handleStatusUpdate);
    };
  }, []);

  return (
    <p
      id={BLOG_ARTICLE_ROUTE_ACTION_STATUS_ID}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={BLOG_ARTICLE_ROUTE_ACTION_STATUS_LABEL}
      className="sr-only"
    >
      {statusMessage}
    </p>
  );
}

export function BlogTrackedLink({
  articleSlug,
  category,
  children,
  className,
  ctaRole,
  eventName = 'blog_article_transition_clicked',
  href,
  rel,
  source,
  target,
}: BlogTrackedLinkProps) {
  const routeActionStatusMessage = getBlogArticleRouteActionStatusMessage({ href, source });

  return (
    <Link
      href={href}
      className={className}
      aria-describedby={BLOG_ARTICLE_ROUTE_ACTION_STATUS_ID}
      rel={rel}
      target={target}
      onFocus={() => {
        announceBlogArticleRouteActionStatus(routeActionStatusMessage);
      }}
      onClick={() => {
        announceBlogArticleRouteActionStatus(routeActionStatusMessage);
        analytics.capture(eventName, {
          article_slug: articleSlug,
          category,
          cta_role: ctaRole,
          destination: href,
          source,
        });
      }}
    >
      {children}
    </Link>
  );
}
