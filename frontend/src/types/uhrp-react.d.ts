declare module 'uhrp-react' {
  import * as React from 'react'

  export interface ImgProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string
    fallback?: React.ReactNode
  }

  export const Img: React.FC<ImgProps>

  export interface SourceProps extends React.SourceHTMLAttributes<HTMLSourceElement> {
    src: string
    loading?: React.ReactNode
  }

  export const Source: React.FC<SourceProps>
}
