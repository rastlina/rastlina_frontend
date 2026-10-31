/* eslint-disable react-refresh/only-export-components -- Build-only server entry. */
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import { StrictMode, type ReactNode } from 'react';
import App from './App';
import { Seo } from './components/seo/Seo';
import { publicPages } from './components/seo/RouteSeo';
import About from './pages/About';
import ShippingPolicyPage from './pages/ShippingPolicyPage';
import ReturnsRefundPolicyPage from './pages/ReturnsRefundPage';
import ReplacementPolicyPage from './pages/ReplacementPolicyPage';
import Contact from './pages/Contact';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import { blogs } from './data/blogs';

export const articles = blogs;
export function renderPublicContent(path: string) {
  const pages = { '/about': About, '/bulk': Contact, '/privacy-policy': PrivacyPolicyPage, '/terms-and-conditions': TermsPage, '/shipping-policy': ShippingPolicyPage, '/returns-refund-policy': ReturnsRefundPolicyPage, '/replacement-policy': ReplacementPolicyPage };
  const Page = pages[path as keyof typeof pages];
  return Page ? renderToString(<HelmetProvider context={{}}><StaticRouter location={path}><Page /></StaticRouter></HelmetProvider>) : '';
}

export const metadataPaths = Object.keys(publicPages);
export function renderMetadata(path: string) {
  const page = publicPages[path];
  if (!page) throw new Error('Unknown public metadata route');
  const context: Record<string, unknown> = {};
  renderToString(<HelmetProvider context={context}><Seo {...page} path={path} /></HelmetProvider>);
  return context.helmet;
}

const HomeRouter = ({ children }: { children: ReactNode }) => <StaticRouter location="/">{children}</StaticRouter>;

export function render() {
  const context: Record<string, unknown> = {};
  const html = renderToString(<StrictMode><HelmetProvider context={context}><App Router={HomeRouter} /></HelmetProvider></StrictMode>);
  return { html, helmet: context.helmet };
}
