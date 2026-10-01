import React from 'react';

interface TankButtonProps {
    href: string;
    className: string;   // base button styling (padding, colours, radius)
    liquid: string;      // colour of the liquid that fills on hover
    children: React.ReactNode;
}

// A link that fills up like a tank on hover: liquid rises with a rolling wave and a few bubbles.
export default function TankButton({ href, className, liquid, children }: TankButtonProps) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`group relative isolate overflow-hidden ${className}`}
        >
            <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 -z-10 h-0 group-hover:h-[115%] group-focus-visible:h-[115%] transition-[height] duration-700 ease-out motion-reduce:transition-none"
                style={{ backgroundColor: liquid }}
            >
                {/* Wave crest riding on top of the liquid */}
                <svg className="absolute bottom-full left-0 h-2 w-[200%] animate-wave opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100" viewBox="0 0 200 10" preserveAspectRatio="none">
                    <path d="M0 5Q12.5 0 25 5T50 5T75 5T100 5T125 5T150 5T175 5T200 5V10H0Z" fill={liquid} />
                </svg>
                {/* Bubbles */}
                {[18, 46, 72].map((left, i) => (
                    <span
                        key={left}
                        className="absolute bottom-0 h-1.5 w-1.5 rounded-full bg-white/40 opacity-0 group-hover:animate-bubble"
                        style={{ left: `${left}%`, animationDelay: `${0.3 + i * 0.35}s` }}
                    />
                ))}
            </span>
            {children}
        </a>
    );
}
