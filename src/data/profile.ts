export interface Project {
    id: string;
    title: string;
    category: string;
    impact: string; // 1-line impact statement
    tools: string[];
    description: string;
    bullets: string[]; // Achievements
    problem?: string;
    solution?: string;
    results?: string; // Detailed metrics
    links?: { label: string; url: string }[];
    featured?: boolean;
}

export interface Experience {
    id: string;
    role: string;
    company: string;
    location: string;
    date: string;
    bullets: string[];
}

export interface Profile {
    name: string;
    title: string;
    tagline: string;
    location: string;
    email: string;
    linkedin: string;
    resumeUrl: string;
    about: {
        summary: string;
        highlights: string[];
        education: {
            degree: string;
            school: string;
            graduation: string;
            gpa?: string;
        }
    };
    skills: {
        category: string;
        items: string[];
    }[];
    experience: Experience[];
    projects: Project[];
}

export const profile: Profile = {
    name: "Hekmat Kawas",
    title: "Chemical Engineering Undergraduate",
    tagline: "Bridging process design, data analysis, and sustainable innovation.",
    location: "Toronto, ON",
    email: "kawas.hekmat@gmail.com",
    linkedin: "https://linkedin.com/in/hekmat-kawas/",
    resumeUrl: "/resume.pdf",
    about: {
        summary: "Bachelor of Chemical Engineering student at Toronto Metropolitan University with a strong foundation in process design, optimization, and R&D. Experienced in powder coating formulations, batch data analysis, and safety-critical lab operations. Skilled in leveraging technical tools like Aspen Plus, SolidWorks, and Python to solve engineering challenges.",
        highlights: [
            "Process Simulation & Design (Aspen Plus, HYSYS)",
            "Equipment Sizing & Modeling (SolidWorks, Python)",
            "Data Analysis & Digitization (Excel, Python)",
            "Safety & Compliance (WHMIS, SDS)"
        ],
        education: {
            degree: "Bachelor of Chemical Engineering",
            school: "Toronto Metropolitan University",
            graduation: "Graduating Dec, 2026",
            gpa: undefined,
        }
    },
    skills: [
        {
            category: "Software",
            items: ["Aspen Plus", "Aspen HYSYS", "SolidWorks", "Excel & MS tools"]
        },
        {
            category: "Lab & Process Skills",
            items: ["Chemical handling", "Troubleshooting", "Technical reporting", "Lab-scale and pilot-scale equipment"]
        },
        {
            category: "Programming Languages",
            items: ["MATLAB", "Java", "Python"]
        }
    ],
    experience: [
        {
            id: "exp1",
            role: "R&D Lab Technician",
            company: "Protech Group",
            location: "Toronto, ON", // Inferred location from resume context or typical location 
            date: "Jan 2025 – Aug 2025",
            bullets: [
                "Prepared and validated 75+ powder coating formulations using mixing, extrusion, and grinding equipment for automotive and industrial applications, used to generate 70 tons annually resulting in $725K+ in reoccurring revenue.",
                "Conducted error analysis using lab instrumentation and solved 5+ contamination cases, improving batch pass rates by 20% and freeing lab capacity to execute additional formulations contributing to $15K+ in profit.",
                "Led the digitization of manual batch records and lab documentation for 200+ formulations, increasing operational efficiency and reducing downtime by 7% ($10.5K+ annual savings).",
                "Analyzed batch data in Excel to compare trial performance across variables such as resin ratio, cure time, and pigment load, helping refine formulation parameters increasing productivity by 30% by saving 5 hours per formulation.",
                "Identified root causes of sample failures related to dispersion quality and formulation balance, implementing targeted adjustments that enabled successful client evaluation samples.",
                "Operated within a safety-critical chemical laboratory, maintaining compliance with WHMIS, SDS-guided chemical handling, and hazardous waste protocols, contributing to zero findings during internal safety audits."
            ]
        },

    ],
    projects: [
        {
            id: "p1",
            title: "Lithium Recycling Plant Design",
            category: "Process Design",
            impact: "Designed scalable plant to process 1000 tons of batteries/year.",
            tools: ["Hydrometallurgy", "Process Flow Diagrams", "Mass & Energy Balances"],
            description: "Designed a scalable process plant that recovers lithium from used lithium-ion batteries using hydrometallurgical techniques able to process up to 1000 tons of batteries annually.",
            featured: true,
            bullets: [
                "Created process flow diagrams, and performed mass and energy balances to make decisions regarding equipment sizing, utility requirements, and process integration decisions.",
                "Selected and sized unit operations optimizing for the most efficient throughput, residence time, and recovery constraints."
            ],
            links: [
                { label: "View Report", url: "/projects/lithium-recycling-report.pdf" } // Placeholder
            ]
        },
        {
            id: "p2",
            title: "Liquid-Liquid Blending Unit Design",
            category: "Equipment Design",
            impact: "Engineered stirred-tank blending system for miscible liquids.",
            tools: ["SolidWorks", "Process Control", "Impeller Design"],
            description: "Engineered a stirred-tank blending system for miscible liquids, optimized through impeller design and tank geometry.",
            featured: true,
            bullets: [
                "Modeled equipment in SolidWorks and evaluated mixing geometry to support uniform concentration at steady state.",
                "Evaluated and selected process control strategies for optimal concentration consistency and minimal composition variability."
            ],
            links: [
                { label: "View Model", url: "/projects/blending-unit-design.pdf" } // Placeholder
            ]
        },
        {
            id: "p3",
            title: "Process Equipment Sizing Program",
            category: "Coding",
            impact: "Developed Python app for pump, pipe, and reactor sizing.",
            tools: ["Python", "Fluid Mechanics", "Design Correlations"],
            description: "Developed a Python-based process equipment sizing application integrating fluid mechanics and reaction engineering to evaluate pump performance, pipe hydraulics, and reactor sizing under user-defined conditions.",
            featured: true,
            bullets: [
                "Implemented core chemical engineering design correlations, including flow regime analysis, friction factor correlations, and total dynamic head calculations within an interactive user interface.",
                "Developed preliminary equipment sizing and performance estimates used to support preliminary process design, equipment selection, and early-phase feasibility assessment."
            ],
            links: [
                { label: "View Code", url: "/projects/sizing-program-code/index.html" } // Folder link
            ]
        }
    ]
};
