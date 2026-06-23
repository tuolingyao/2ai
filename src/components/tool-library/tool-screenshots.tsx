'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ToolScreenshotsProps {
  urls: string[]
  name: string
}

export function ToolScreenshots({ urls, name }: ToolScreenshotsProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  if (urls.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-muted">
        <Image
          src={urls[selectedIndex]}
          alt={`${name} 截图 ${selectedIndex + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 720px"
        />
      </div>

      {urls.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {urls.map((url, i) => (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              className={`relative h-16 w-28 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                i === selectedIndex ? 'border-primary' : 'border-border hover:border-muted-foreground/50'
              }`}
            >
              <Image
                src={url}
                alt={`${name} 缩略图 ${i + 1}`}
                fill
                className="object-cover"
                sizes="112px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
