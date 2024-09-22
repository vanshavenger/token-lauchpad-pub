import { t } from "@/lib/constants"
import { CheckCircle2, Coins, Layers, Rocket } from "lucide-react"
import React from "react"

const StepIndicator = React.memo(({ currentStep }: { currentStep: number }) => {
  const steps = [
    { title: t('steps.prepare'), icon: Coins },
    { title: t('steps.create'), icon: Rocket },
    { title: t('steps.mint'), icon: Layers },
    { title: t('steps.complete'), icon: CheckCircle2 },
  ]

  return (
    <div className='flex justify-between mb-8'>
      {steps.map((step, index) => (
        <div key={step.title} className='flex flex-col items-center'>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              index <= currentStep ? 'bg-yellow-300' : 'bg-gray-300'
            }`}
          >
            <step.icon className='w-5 h-5 text-black' />
          </div>
          <span className='text-xs mt-1'>{step.title}</span>
        </div>
      ))}
    </div>
  )
})

StepIndicator.displayName = 'StepIndicator'

export default StepIndicator
