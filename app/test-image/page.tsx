// Test component to debug image loading
'use client'

import Image from 'next/image'
import { useState } from 'react'

export default function ImageTest() {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Image Loading Test</h2>
      
      {/* Test 1: Regular img tag */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Test 1: Regular img tag</h3>
        <img
          src="/images/campus/ODeLbuilding.jpg"
          alt="Test ODeL Building"
          className="w-64 h-32 object-cover border"
          onLoad={() => console.log('✅ Regular img loaded')}
          onError={() => console.log('❌ Regular img failed')}
        />
      </div>

      {/* Test 2: Next.js Image component */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Test 2: Next.js Image component</h3>
        <Image
          src="/images/campus/ODeLbuilding.jpg"
          alt="Test ODeL Building"
          width={256}
          height={128}
          className="border"
          onLoad={() => console.log('✅ Next.js Image loaded')}
          onError={() => console.log('❌ Next.js Image failed')}
        />
      </div>

      {/* Test 3: Different path variations */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Test 3: Path variations</h3>
        <div className="space-y-2">
          <div>
            <p>Original path: /images/campus/ODeLbuilding.jpg</p>
            <img src="/images/campus/ODeLbuilding.jpg" alt="Original" className="w-32 h-16 object-cover border" />
          </div>
          <div>
            <p>Lowercase path: /images/campus/odelbuilding.jpg</p>
            <img src="/images/campus/odelbuilding.jpg" alt="Lowercase" className="w-32 h-16 object-cover border" />
          </div>
        </div>
      </div>

      {/* Debug info */}
      <div className="bg-gray-100 p-4 rounded">
        <h3 className="font-semibold mb-2">Debug Info:</h3>
        <p>Image Error: {imageError ? 'Yes' : 'No'}</p>
        <p>Image Loaded: {imageLoaded ? 'Yes' : 'No'}</p>
        <p>Current URL: {typeof window !== 'undefined' ? window.location.href : 'Server-side'}</p>
      </div>
    </div>
  )
}
