/* eslint-disable react-refresh/only-export-components -- Build-only server entry. */
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import { StrictMode, type ReactNode } from 'react';
import App from './App';
import { Seo } from './components/seo/Seo';
import { publicPages } from './components/seo/RouteSeo';

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
