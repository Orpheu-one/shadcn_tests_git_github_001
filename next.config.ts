import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images:{
    remotePatterns:[

      {hostname:"images.pexels.com"},

      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**', // Permite qualquer caminho dentro deste hostname
      },
      // Adicionar também o domínio do placeholder, por precaução, se usarmos HTTPS
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ]
  }
};

export default nextConfig;
