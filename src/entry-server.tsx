/* eslint-disable react-refresh/only-export-components -- Build-only server entry. */
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import { StrictMode, type ReactNode } from 'react';
import App from './App';

const HomeRouter = ({ children }: { children: ReactNode }) => <StaticRouter location="/">{children}</StaticRouter>;

export function render() {
  const context: Record<string, unknown> = {};
  const html = renderToString(<StrictMode><HelmetProvider context={context}><App Router={HomeRouter} /></HelmetProvider></StrictMode>);
  return { html, helmet: context.helmet };
}
