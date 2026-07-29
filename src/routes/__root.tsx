import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { TanStackDevtools } from "@tanstack/react-devtools"
import type { QueryClient } from "@tanstack/react-query"
import { Toaster } from "sonner"
import { GoogleOAuthProvider } from "@react-oauth/google"

import appCss from "../styles.css?url"
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL, pageMeta } from "@/lib/seo"

export interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#0B1220" },
      ...pageMeta({
        title: SITE_TITLE,
        description: SITE_DESCRIPTION,
        url: SITE_URL,
      }),
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/sportly-mark.png", type: "image/png" },
      { rel: "canonical", href: SITE_URL },
    ],
  }),
  notFoundComponent: NotFound,
  shellComponent: RootDocument,
})

function NotFound() {
  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col items-center justify-center px-6 text-center">
      <p className="text-primary text-sm font-semibold tracking-wide uppercase">
        404
      </p>
      <h1 className="font-heading mt-3 text-3xl font-bold">Page not found</h1>
      <p className="text-muted-foreground mt-2">
        The campaign you're looking for may have ended or the link is incorrect.
      </p>
    </main>
  )
}

/**
 * Drives scroll reveals ([data-reveal] -> [data-reveal="in"]).
 *
 * This runs inline in <head>, at parse time, rather than from a React effect:
 * the hidden state is baked into the SSR markup, so if we waited for hydration
 * every section below the fold would sit blank until the client bundle booted.
 *
 * It marks <html data-reveal-ready> first - the CSS only hides content once
 * that attribute exists, so if this script never runs (JS off, CSP, no
 * IntersectionObserver, reduced motion) the page renders fully visible.
 */
const REVEAL_SCRIPT = `(function(){
var w=window,d=document;
if(!w.IntersectionObserver||!w.MutationObserver)return;
try{if(w.matchMedia('(prefers-reduced-motion: reduce)').matches)return}catch(e){}
d.documentElement.setAttribute('data-reveal-ready','');
var io=new w.IntersectionObserver(function(es){
for(var i=0;i<es.length;i++){if(!es[i].isIntersecting)continue;
es[i].target.setAttribute('data-reveal','in');io.unobserve(es[i].target)}
},{rootMargin:'0px 0px 200px 0px'});
var q=0;
function scan(){q=0;var e=d.querySelectorAll('[data-reveal=""]');for(var i=0;i<e.length;i++)io.observe(e[i])}
function schedule(){if(q)return;q=1;(w.requestAnimationFrame||w.setTimeout)(scan)}
new w.MutationObserver(schedule).observe(d.documentElement,{childList:true,subtree:true});
schedule()})()`

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: REVEAL_SCRIPT }} />
      </head>
      <body>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
          {children}
        </GoogleOAuthProvider>
        <Toaster
          position="top-center"
          richColors
          closeButton
          toastOptions={{ className: "font-sans" }}
        />
        {import.meta.env.DEV ? (
          <TanStackDevtools
            config={{ position: "bottom-right" }}
            plugins={[
              {
                name: "Tanstack Router",
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
        ) : null}
        <Scripts />
      </body>
    </html>
  )
}
