// Type declarations for Next.js modules
declare module 'next/image' {
  import { DetailedHTMLProps, ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    layout?: 'fixed' | 'intrinsic' | 'responsive' | 'fill';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    quality?: number;
    priority?: boolean;
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
  }
  
  const Image: React.FC<ImageProps>;
  export default Image;
}

declare module 'next/router' {
  export interface RouterProps {
    pathname: string;
    query: { [key: string]: string | string[] };
    asPath: string;
    push: (url: string, as?: string) => Promise<boolean>;
    replace: (url: string, as?: string) => Promise<boolean>;
    reload: () => void;
    back: () => void;
    prefetch: (url: string) => Promise<void>;
    beforePopState: (cb: (state: any) => boolean) => void;
    events: {
      on: (event: string, cb: (...args: any[]) => void) => void;
      off: (event: string, cb: (...args: any[]) => void) => void;
      emit: (event: string, ...args: any[]) => void;
    };
    isFallback: boolean;
    isReady: boolean;
  }

  export function useRouter(): RouterProps;
}

declare module 'next/link' {
  import { AnchorHTMLAttributes, FC } from 'react';
  
  export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
    href: string;
    as?: string;
    replace?: boolean;
    scroll?: boolean;
    shallow?: boolean;
    passHref?: boolean;
    prefetch?: boolean;
  }
  
  const Link: FC<LinkProps>;
  export default Link;
}
