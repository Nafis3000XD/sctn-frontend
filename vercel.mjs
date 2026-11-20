const value = process.env.SCTN_API_ORIGIN;
if (!value) throw new Error('Set SCTN_API_ORIGIN to the HTTPS origin of the SCTN backend.');

const backend = new URL(value);
if (backend.protocol !== 'https:' || backend.username || backend.password || backend.pathname !== '/' || backend.search || backend.hash) {
  throw new Error('SCTN_API_ORIGIN must be an HTTPS origin without credentials, path, query, or fragment.');
}

export const config = {
  framework: 'vite',
  installCommand: 'npm ci --include=dev',
  buildCommand: 'npm run build',
  outputDirectory: 'dist',
  rewrites: [
    { source: '/api/:path*', destination: backend.origin + '/api/:path*' },
    { source: '/uploads/:path*', destination: backend.origin + '/uploads/:path*' },
    { source: '/healthz', destination: backend.origin + '/healthz' },
    { source: '/(.*)', destination: '/index.html' }
  ]
};
