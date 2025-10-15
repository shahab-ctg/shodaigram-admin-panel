
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000", 
        pathname: "/**",
      },
     
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
      { protocol: "https", hostname: "i.imgur.com", pathname: "/**" },
    ],
    
  },
};

export default nextConfig;
