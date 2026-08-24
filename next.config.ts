import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
    Gelistirme rozetini kapatir. Rozet sol alt kosede icerigin uzerine
    biniyor ve ekran goruntulerinde prototipin dev modunda calistigi
    izlenimini veriyordu.
  */
  devIndicators: false,
};

export default nextConfig;
