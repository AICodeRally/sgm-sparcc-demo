import { CheckCircledIcon, LayersIcon, CodeIcon, RocketIcon } from '@radix-ui/react-icons';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="glass-card p-12 max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-[color:var(--color-primary)]">
            SGM Summit Demo
          </h1>
          <h2 className="text-2xl text-[color:var(--color-muted)] mb-4">
            Sales Governance Manager
          </h2>
          <p className="text-[color:var(--color-muted)] text-lg">
            Demonstrating <strong>Contracts + Ports + Bindings</strong> architecture
            <br />
            for flexible, testable, zero-dependency demos
          </p>
        </div>

        {/* Architecture Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="glass-card p-6 text-center">
            <LayersIcon className="w-12 h-12 mx-auto mb-4 text-[color:var(--color-primary)]" />
            <h3 className="font-bold text-lg mb-2">Contracts</h3>
            <p className="text-sm text-[color:var(--color-muted)]">TypeScript types + Zod schemas</p>
          </div>
          <div className="glass-card p-6 text-center">
            <CodeIcon className="w-12 h-12 mx-auto mb-4 text-[color:var(--color-primary)]" />
            <h3 className="font-bold text-lg mb-2">Ports</h3>
            <p className="text-sm text-[color:var(--color-muted)]">Service interfaces (DI)</p>
          </div>
          <div className="glass-card p-6 text-center">
            <RocketIcon className="w-12 h-12 mx-auto mb-4 text-[color:var(--color-primary)]" />
            <h3 className="font-bold text-lg mb-2">Bindings</h3>
            <p className="text-sm text-[color:var(--color-muted)]">Synthetic | Mapped | Live</p>
          </div>
        </div>

        {/* Features */}
        <div className="mb-12">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <CheckCircledIcon className="text-[color:var(--color-success)]" />
            Implemented (MVP)
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="glass-card p-4">
              <strong className="text-[color:var(--color-primary)]">Policies</strong>
              <p className="text-[color:var(--color-muted)]">Versioning, lifecycle, search</p>
            </div>
            <div className="glass-card p-4">
              <strong className="text-[color:var(--color-primary)]">Territories</strong>
              <p className="text-[color:var(--color-muted)]">Hierarchy, assignment tracking</p>
            </div>
            <div className="glass-card p-4">
              <strong className="text-[color:var(--color-primary)]">Approvals</strong>
              <p className="text-[color:var(--color-muted)]">Workflows, SLA tracking</p>
            </div>
            <div className="glass-card p-4">
              <strong className="text-[color:var(--color-primary)]">Audit Logs</strong>
              <p className="text-[color:var(--color-muted)]">Append-only event logging</p>
            </div>
            <div className="glass-card p-4">
              <strong className="text-[color:var(--color-primary)]">Links</strong>
              <p className="text-[color:var(--color-muted)]">ConnectItem pattern</p>
            </div>
            <div className="glass-card p-4">
              <strong className="text-[color:var(--color-primary)]">Search</strong>
              <p className="text-[color:var(--color-muted)]">IndexItem pattern</p>
            </div>
          </div>
        </div>

        {/* API Links */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold mb-4">Try the API</h3>

          <a href="/api/sgm/diagnostics" target="_blank" className="glass-card-hover p-4 block">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-bold">Diagnostics</div>
                <div className="text-sm text-[color:var(--color-muted)]">System status, binding mode, data counts</div>
              </div>
              <div className="text-[color:var(--color-primary)] font-mono text-sm">GET /api/sgm/diagnostics</div>
            </div>
          </a>

          <a href="/api/sgm/policies?status=published" target="_blank" className="glass-card-hover p-4 block">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-bold">List Policies</div>
                <div className="text-sm text-[color:var(--color-muted)]">Query policies with filters</div>
              </div>
              <div className="text-[color:var(--color-primary)] font-mono text-sm">GET /api/sgm/policies</div>
            </div>
          </a>

          <a href="/api/sgm/policies/pol-001" target="_blank" className="glass-card-hover p-4 block">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-bold">Policy Detail</div>
                <div className="text-sm text-[color:var(--color-muted)]">Policy + audit logs + links</div>
              </div>
              <div className="text-[color:var(--color-primary)] font-mono text-sm">GET /api/sgm/policies/[id]</div>
            </div>
          </a>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-[color:var(--color-border)] text-center text-sm text-[color:var(--color-muted)]">
          <p>
            <strong>Binding Mode:</strong> Synthetic (zero external dependencies)
            <br />
            <strong>Data:</strong> 10 policies, 10 territories, 3 approvals, 12 links
            <br />
            <strong>Port:</strong> 3003 (Summit tier standard)
          </p>
        </div>
      </div>
    </main>
  )
}
