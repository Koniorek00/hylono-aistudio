'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import type { BlogCategory } from '@/constants/content';
import analytics from '@/src/lib/analytics';

type BlogRouteEvent =
  | 'blog_route_article_clicked'
  | 'blog_route_cta_clicked'
  | 'blog_route_transition_clicked';

type BlogRouteSource = 'article_grid' | 'empty_state' | 'featured_article' | 'hero' | 'path_cards';

interface BlogHubTrackedLinkProps {
  articleSlug?: string;
  category?: BlogCategory;
  children: ReactNode;
  className: string;
  ctaRole: 'contextual' | 'primary' | 'secondary' | 'supporting';
  eventName?: BlogRouteEvent;
  href: string;
  source: BlogRouteSource;
  statusMessage?: string;
}

export const BLOG_ROUTE_ACTION_STATUS_ID = 'blog-route-action-status';
const BLOG_ROUTE_ACTION_STATUS_LABEL = 'Blog route action status';
const BLOG_ROUTE_ACTION_STATUS_EVENT = 'blog-route-action-status-update';
export const BLOG_ROUTE_ACTION_READY_STATUS =
  'Blog route handoffs are ready. Use article index, research, condition guidance, product hubs, contact, article, support, and route cards for next steps.';

function getBlogRouteActionStatusMessage({
  href,
  source,
}: Pick<BlogHubTrackedLinkProps, 'href' | 'source'>) {
  if (href === '#blog-article-grid') {
    return 'Opening article index from the blog route.';
  }

  if (href === '/research') {
    return 'Opening research hub from the blog route.';
  }

  if (href.startsWith('/conditions')) {
    return 'Opening condition guidance from the blog route.';
  }

  if (href === '/store') {
    return 'Opening product hubs from the blog route.';
  }

  if (href === '/contact') {
    return 'Opening Hylono contact from the blog route.';
  }

  if (href.startsWith('/blog/')) {
    return 'Opening article from the blog route.';
  }

  if (href.startsWith('/product/')) {
    return 'Opening product hub from the blog route.';
  }

  if (href === '/protocols') {
    return 'Opening protocols from the blog route.';
  }

  return `Opening ${source.replaceAll('_', ' ')} from the blog route.`;
}

function announceBlogRouteActionStatus(message: string) {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent<{ message: string }>(BLOG_ROUTE_ACTION_STATUS_EVENT, {
      detail: { message },
    })
  );
}

export function BlogHubRouteActionStatus() {
  const [statusMessage, setStatusMessage] = useState(BLOG_ROUTE_ACTION_READY_STATUS);

  useEffect(() => {
    const handleStatusUpdate = (event: Event) => {
      const nextMessage = (event as CustomEvent<{ message?: string }>).detail?.message;

      if (nextMessage) {
        setStatusMessage(nextMessage);
      }
    };

    window.addEventListener(BLOG_ROUTE_ACTION_STATUS_EVENT, handleStatusUpdate);

    return () => {
      window.removeEventListener(BLOG_ROUTE_ACTION_STATUS_EVENT, handleStatusUpdate);
    };
  }, []);

  return (
    <p
      id={BLOG_ROUTE_ACTION_STATUS_ID}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={BLOG_ROUTE_ACTION_STATUS_LABEL}
      className="sr-only"
    >
      {statusMessage}
    </p>
  );
}

export function BlogHubTrackedLink({
  articleSlug,
  category,
  children,
  className,
  ctaRole,
  eventName = 'blog_route_transition_clicked',
  href,
  source,
  statusMessage,
}: BlogHubTrackedLinkProps) {
  const routeActionStatusMessage =
    statusMessage ?? getBlogRouteActionStatusMessage({ href, source });

  return (
    <Link
      href={href}
      className={className}
      aria-describedby={BLOG_ROUTE_ACTION_STATUS_ID}
      onFocus={() => {
        announceBlogRouteActionStatus(routeActionStatusMessage);
      }}
      onClick={() => {
        announceBlogRouteActionStatus(routeActionStatusMessage);
        analytics.capture(eventName, {
          ...(articleSlug ? { article_slug: articleSlug } : {}),
          ...(category ? { category } : {}),
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
