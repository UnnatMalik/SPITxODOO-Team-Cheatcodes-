export function Loader() {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary animate-spin"></div>
      </div>
      <p className="text-sm font-medium text-foreground/70">Loading...</p>
    </div>
  )
}

export function FullPageLoader() {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary animate-spin"></div>
        </div>
        <div className="text-center">
          <p className="font-semibold text-foreground">Processing</p>
          <p className="text-sm text-foreground/60">Please wait...</p>
        </div>
      </div>
    </div>
  )
}
