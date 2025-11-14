import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images:{
    remotePatterns:[

      // >>> ADIÇÃO NECESSÁRIA PARA O FAKER (cdn.jsdelivr.net) <<<
      {
        protocol: 'https',
        hostname: 'cdn.jsdelivr.net',
        port: '',
        pathname: '/**', // Necessário para cobrir todos os caminhos das imagens do Faker
      },
      
      // Padrões Existentes:
      {hostname:"images.pexels.com"},

      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**', // Permite qualquer caminho dentro deste hostname
      },
      // Adicionar tambÃ©m o domÃ­nio do placeholder, por precauÃ§Ã£o, se usarmos HTTPS
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
