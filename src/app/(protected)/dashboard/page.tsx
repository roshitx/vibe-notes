export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back to Vibe Notes.
          </p>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
              <h3 className="tracking-tight text-sm font-medium">Coming Soon</h3>
              <p className="text-muted-foreground text-xs mt-2">Dashboard widgets are under construction.</p>
          </div>
      </div>
    </div>
  );
}
