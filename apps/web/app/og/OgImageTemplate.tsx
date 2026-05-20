interface OgImageTemplateProps {
  title: string
  cover?: string | null
  category?: string | null
}

export function OgImageTemplate({
  title,
  cover,
  category,
}: OgImageTemplateProps) {
  return (
    <div
      data-testid="og-wrapper"
      style={{
        width: '1200px',
        height: '630px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: cover
          ? 'transparent'
          : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      }}
    >
      {cover && (
        <img
          data-testid="og-cover"
          src={cover}
          alt=""
          style={{
            position: 'absolute',
            inset: '0',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'blur(8px) brightness(0.4)',
          }}
        />
      )}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px',
          width: '100%',
          height: '100%',
        }}
      >
        {category && (
          <div style={{ display: 'flex', marginBottom: '24px' }}>
            <span
              style={{
                fontSize: '14px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: '#4ade80',
                background: 'rgba(74, 222, 128, 0.1)',
                padding: '6px 14px',
                borderRadius: '4px',
                border: '1px solid rgba(74, 222, 128, 0.3)',
              }}
            >
              {category}
            </span>
          </div>
        )}
        <div
          style={{
            fontSize: '56px',
            fontWeight: 700,
            color: '#ffffff',
            lineHeight: 1.2,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: '32px',
            fontSize: '18px',
            color: 'rgba(251, 251, 251, 0.5)',
          }}
        >
          sawl.dev
        </div>
      </div>
    </div>
  )
}
