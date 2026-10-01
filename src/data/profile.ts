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
    stats: { value: string; label: string }[];
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
    title: "B.Eng. Chemical Engineering (Dec 2026) · Junior Metallurgist",
    tagline: "Open to full-time new graduate roles in process engineering, metallurgy, and R&D. Bridging pilot-scale operations, process design, and data-driven optimization.",
    location: "Toronto, ON",
    email: "kawas.hekmat@gmail.com",
    linkedin: "https://linkedin.com/in/hekmat-kawas/",
    resumeUrl: "/resume.pdf",
    stats: [
        { value: "$725K+", label: "recurring revenue from 75+ formulations taken to production" },
        { value: "89 → 91%", label: "Mg extraction after optimizing a pilot leach circuit" },
        { value: "23%", label: "faster filtration from a redesigned filter press" },
        { value: "15,000 t/yr", label: "lithium recycling plant designed (capstone)" },
    ],
    about: {
        summary: "Chemical Engineering student at Toronto Metropolitan University completing my final course (graduating Dec 2026) and available now for full-time new graduate roles. Currently working as a Junior Metallurgist in process research at Ortech Inc. Hands-on experience optimizing pilot-scale leach circuits, scaling extraction processes, and developing powder coating formulations in R&D. Skilled in mass and energy balances, equipment and piping sizing, and tools like Aspen Plus, SolidWorks, and Python.",
        highlights: [
            "Pilot-Scale Operations & Hydrometallurgy (Leaching, Filtration)",
            "Process Design (Mass & Energy Balances, PFDs, Equipment Sizing)",
            "Process Simulation & Modeling (Aspen Plus, HYSYS, Python)",
            "Safety & SOP Development (WHMIS, Acid Handling)"
        ],
        education: {
            degree: "Bachelor of Engineering in Chemical Engineering",
            school: "Toronto Metropolitan University",
            graduation: "Expected Dec 2026",
            gpa: undefined,
        }
    },
    skills: [
        {
            category: "Process Engineering",
            items: ["Mass & energy balances", "Equipment & piping sizing", "PFDs", "Process optimization", "Pilot-scale operations"]
        },
        {
            category: "Software & Programming",
            items: ["Aspen Plus", "Aspen HYSYS", "Python", "SolidWorks", "Excel", "MATLAB", "Java"]
        },
        {
            category: "Lab & Process Skills",
            items: ["Leaching", "Filter press & vacuum filtration", "Hazardous material handling (WHMIS)", "SOP development"]
        }
    ],
    experience: [
        {
            id: "exp2",
            role: "Junior Metallurgist - Process Research",
            company: "Ortech Inc.",
            location: "Mississauga, ON",
            date: "May 2026 – Present",
            bullets: [
                "Optimized Mg extraction in a pilot-scale HCl leach circuit by testing acid concentrations from 10–20%, identifying 16% as optimal and raising extraction from 89% to 91%.",
                "Redesigned pilot filter press setup for leach residue separation, expanding filtration area from 8 to 12 plates and revising the operating procedure to cut filtration time by 23%.",
                "Co-designed and scaled extraction processes for magnesium chloride recovery, introducing a water-wash and vacuum filtration protocol that recovered 93% purity silica from the process residue.",
                "Diagnosed and repaired leaking lines and miscalibrated dosing pumps across pilot plant and lab unit operations, cutting chemical consumption by 5% and reducing downtime by 1 hour/day.",
                "Wrote 3 SOPs for pilot plant HCl charging and acid transfers and trained a new hire on safe acid handling.",
                "Co-authored a client technical report on pilot-scale MgCl₂ leach results, compiling test data and mass balances."
            ]
        },
        {
            id: "exp1",
            role: "R&D Lab Technician",
            company: "Protech Group",
            location: "Toronto, ON",
            date: "Jan 2025 – Aug 2025",
            bullets: [
                "Prepared and validated powder coating formulations using mixing, extrusion, and grinding, including 75+ that advanced to full-scale production, generating 70 tons annually and $725K+ in recurring revenue.",
                "Resolved 5+ contamination cases by systematically isolating raw materials, equipment, and process steps, raising batch pass rates by 20% and freeing lab capacity that added $15K+ in profit.",
                "Analyzed Excel batch data on resin ratio, cure time, and pigment load to find patterns in successful trials, cutting trial iterations and saving 5 hours per formulation.",
                "Digitized manual batch records and lab documentation for 200+ formulations, cutting record retrieval time and reducing downtime by 7% ($10.5K+ annual savings).",
                "Diagnosed dispersion and formulation-balance failures in client samples, adjusting formulations, grinding and baking times, and extruder settings until samples passed client evaluation."
            ]
        },
    ],
    projects: [
        {
            id: "p1",
            title: "Lithium Recycling Plant Design (Capstone)",
            category: "Process Design",
            impact: "Designed a 15,000 t/yr battery bioleaching plant recovering ~86% Li as Li₂CO₃.",
            tools: ["Bioleaching", "Mass & Energy Balances", "Equipment & Piping Sizing"],
            description: "Capstone design of a battery bioleaching plant processing 15,000 t/yr of spent lithium-ion batteries, achieving ~86% lithium recovery as Li₂CO₃ (~1,930 t/yr).",
            featured: true,
            bullets: [
                "Sized all equipment and piping, including 2 bioleaching batch reactors (54 m³ each), 4 membrane filter presses, and 35 pipelines and pumps with pressure drop and NPSH checks.",
                "Performed mass balances for a 15,000 t/yr battery bioleaching plant, achieving ~86% Li recovery as Li₂CO₃ (~1,930 t/yr).",
                "Completed energy balances for 15 major units, including 443 kW aeration compressors and a 325 kW heat exchanger."
            ],
            links: [
                { label: "Report 1 (Nov 2025)", url: "/projects/lithium-recycling-report.pdf" },
                { label: "Report 2 (Mar 2026)", url: "/projects/lithium-recycling-report-2.pdf" }
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
                "Generated equipment sizing and performance estimates to support preliminary design and feasibility studies."
            ],
            links: [
                { label: "View Code", url: "/projects/sizing-program-code/index.html" }
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
                { label: "View Model", url: "/projects/blending-unit-design.pdf" }
            ]
        }
    ]
};
