import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type WizardStepsProps = {
    steps: string[];
    currentStep: number;
};

export function WizardSteps({ steps, currentStep }: WizardStepsProps) {
    return (
        <ol className="flex items-center gap-2 sm:gap-4">
            {steps.map((step, index) => {
                const isDone = index < currentStep;
                const isCurrent = index === currentStep;

                return (
                    <li
                        key={step}
                        className="flex flex-1 items-center gap-2 sm:gap-3"
                    >
                        <span
                            className={cn(
                                'flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors',
                                isDone && 'bg-violet-600 text-white',
                                isCurrent &&
                                    'bg-violet-600 text-white ring-4 ring-violet-200 dark:ring-violet-500/30',
                                !isDone &&
                                    !isCurrent &&
                                    'bg-violet-100 text-violet-400 dark:bg-white/10 dark:text-violet-300',
                            )}
                        >
                            {isDone ? <Check className="size-4" /> : index + 1}
                        </span>

                        <span
                            className={cn(
                                'hidden text-sm font-semibold sm:block',
                                isCurrent
                                    ? 'text-violet-950 dark:text-white'
                                    : 'text-muted-foreground',
                            )}
                        >
                            {step}
                        </span>

                        {index < steps.length - 1 && (
                            <span
                                className={cn(
                                    'h-0.5 flex-1 rounded-full',
                                    isDone
                                        ? 'bg-violet-600'
                                        : 'bg-violet-100 dark:bg-white/10',
                                )}
                            />
                        )}
                    </li>
                );
            })}
        </ol>
    );
}
