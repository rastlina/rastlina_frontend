declare module 'virtual:rastlina-hero' {
  const slides: Array<{
    id: number;
    image: string;
    link_url?: string;
    optimizedImage: string;
    mobileImage: string;
    optimizedAvif?: string;
    mobileAvif?: string;
  }>;
  export default slides;
}
