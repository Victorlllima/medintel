import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">MedIntel</h1>
        <p className="text-neutral-600 mb-8">Documentação Clínica Automatizada</p>
        <Link
          href="/patients"
          className="inline-block px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 font-medium"
        >
          Acessar Pacientes
        </Link>
      </div>
    </div>
  )
}
