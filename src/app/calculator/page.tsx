import type { Metadata } from 'next';
import SizingCalculator from '@/components/SizingCalculator';
import { profile } from '@/data/profile';

export const metadata: Metadata = {
    title: `Process Equipment Sizing Tool | ${profile.name}`,
    description: 'Pump head and power, pipe sizing and CSTR volume calculators for preliminary process design.',
};

export default function CalculatorPage() {
    return (
        <main className="min-h-screen">
            <header className="border-b border-line bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
                    <a href="/" className="font-bold text-ink hover:text-accent">{profile.name}</a>
                    <a href="/projects/sizing-program-code/index.html" className="text-sm font-medium text-muted hover:text-accent">
                        View Python source
                    </a>
                </div>
            </header>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-ink">Process Equipment Sizing Tool</h1>
                <p className="mt-2 mb-8 text-body max-w-2xl">
                    Preliminary sizing for pumps, pipelines and CSTRs. Results update as you type. All inputs are SI units.
                </p>
                <SizingCalculator />
            </div>
        </main>
    );
}
