import Image from 'next/image'

const assets = {
  light: '/faculty-assistant/logo-horizontal.svg',
  dark: '/faculty-assistant/logo-horizontal-dark-bg.svg',
  symbol: '/faculty-assistant/symbol.svg',
  app: '/faculty-assistant/app-icon.svg',
} as const

export function FacultyAssistantBrand({
  variant = 'light',
  className = '',
  priority = false,
}: {
  variant?: keyof typeof assets
  className?: string
  priority?: boolean
}) {
  const compact = variant === 'symbol' || variant === 'app'

  return (
    <Image
      className={className}
      src={assets[variant]}
      alt={compact ? '' : 'Faculty Assistant'}
      aria-hidden={compact ? true : undefined}
      width={compact ? 52 : 224}
      height={compact ? 52 : 60}
      priority={priority}
    />
  )
}
