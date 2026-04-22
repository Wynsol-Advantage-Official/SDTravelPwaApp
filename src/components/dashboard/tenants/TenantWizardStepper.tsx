"use client"

export function TenantWizardStepper({
  steps,
  currentStep,
}: {
  steps: string[]
  currentStep: number
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {steps.map((step, index) => {
          const isActive = index === currentStep
          const isComplete = index < currentStep

          return (
            <div key={step} className="flex min-w-0 flex-1 items-center gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={[
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    isComplete
                      ? "bg-green-600 text-white"
                      : isActive
                        ? "bg-ocean text-white"
                        : "bg-ocean-deep/10 text-ocean-deep/60 dark:bg-tan-100/10 dark:text-tan-100/60",
                  ].join(" ")}
                >
                  {index + 1}
                </span>
                <span
                  className={[
                    "truncate text-xs font-medium uppercase tracking-[0.16em]",
                    isActive
                      ? "text-ocean dark:text-tan-100"
                      : "text-ocean-deep/50 dark:text-tan-100/50",
                  ].join(" ")}
                >
                  {step}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="h-px flex-1 bg-ocean-deep/10 dark:bg-tan-100/10" />
              )}
            </div>
          )
        })}
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-ocean-deep/10 dark:bg-tan-100/10">
        <div
          className="h-full rounded-full bg-ocean transition-all dark:bg-tan-100"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>
    </div>
  )
}
