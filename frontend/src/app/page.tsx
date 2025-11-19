'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to consultations page
    router.push('/consultations')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-neutral-900 mb-4">MedIntel</h1>
        <p className="text-neutral-600">Carregando...</p>
      </div>
    </div>
  )
}
