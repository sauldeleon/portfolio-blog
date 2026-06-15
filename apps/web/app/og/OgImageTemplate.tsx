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
                color: '#98DFD6',
                background: 'rgba(152, 223, 214, 0.1)',
                padding: '6px 14px',
                borderRadius: '4px',
                border: '1px solid rgba(152, 223, 214, 0.3)',
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
            color: '#FBFBFB',
            textShadow: '0 1px 4px rgba(0,0,0,0.8)',
          }}
        >
          sawl.dev
        </div>
      </div>
    </div>
  )
}
