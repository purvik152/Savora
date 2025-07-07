import { ImageResponse } from 'next/og'
import { UtensilsCrossed } from 'lucide-react'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'hsl(34, 78%, 91%)', // Savora's light theme background
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'hsl(36, 100%, 50%)', // Savora's primary orange color
          borderRadius: '4px',
        }}
      >
        <UtensilsCrossed size={24} />
      </div>
    ),
    {
      ...size,
    }
  )
}
