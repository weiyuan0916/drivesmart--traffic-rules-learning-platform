interface LogoWithThemeProps {
  className?: string
}

export function LogoWithTheme({ className }: LogoWithThemeProps) {
  return (
    <picture className={className}>
      <img
        src="/logo-light.png"
        alt="DriveSmart"
        className="h-full w-auto dark:hidden"
      />
      <img
        src="/logo-dark.png"
        alt="DriveSmart"
        className="h-full w-auto hidden dark:block"
      />
    </picture>
  )
}

interface FaviconWithThemeProps {
  className?: string
  size?: number
}

export function FaviconWithTheme({ className, size = 32 }: FaviconWithThemeProps) {
  return (
    <picture className={className}>
      <img
        src="/favicon.png"
        alt="DriveSmart"
        width={size}
        height={size}
        className="w-full h-full dark:hidden"
      />
      <img
        src="/favicon-dark.png"
        alt="DriveSmart"
        width={size}
        height={size}
        className="w-full h-full hidden dark:block"
      />
    </picture>
  )
}
