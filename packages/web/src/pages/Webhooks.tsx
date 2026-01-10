import { route, RoutableProps } from 'preact-router'
import { ThemeToggle } from '../components'
import { WebhooksPanel } from '../components/WebhooksPanel'

export default function Webhooks(_props: RoutableProps) {
  return (
    <div class="min-h-screen bg-base-200">
      <div class="navbar bg-base-100 shadow-lg">
        <div class="flex-1">
          <button class="btn btn-ghost btn-sm" onClick={() => route('/')}>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <span class="text-xl font-bold px-4">Webhooks</span>
        </div>
        <div class="flex-none flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>

      <div class="p-6">
        <div class="max-w-4xl mx-auto">
          <WebhooksPanel />
        </div>
      </div>
    </div>
  )
}
