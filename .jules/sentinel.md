## 2026-04-04 - Prevent Secret Leakage in Vite Config
**Vulnerability:** The `vite.config.ts` was using the `define` property to inject `process.env.GEMINI_API_KEY` into the frontend build. This is a critical security vulnerability as it embeds the raw API key directly into the public client-side JavaScript bundle, allowing any visitor to extract and abuse it.
**Learning:** Never use build-time injection (like Vite's `define` or `import.meta.env`) for private API keys or secrets in a purely frontend application. The attack surface is the entire client bundle.
**Prevention:** Remove the injection from the build config. Any API calls requiring authentication with a private key must be routed through a secure backend proxy, not made directly from the client.
