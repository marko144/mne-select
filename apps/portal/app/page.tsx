import { Button } from '@mne-select/ui'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">MNE Select Portal</h1>
        <p className="text-xl text-gray-600 mb-8">
          Business management platform
        </p>
        <Button>Get Started</Button>
      </div>
    </main>
  )
}
