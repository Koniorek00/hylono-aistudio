import React from 'react';
import { motion } from 'motion/react';

interface SkillRadarChartProps {
    skills: {
        name: string;
        score: number; // 0-100
        icon: string;
    }[];
}

export const SkillRadarChart: React.FC<SkillRadarChartProps> = ({ skills }) => {
    const centerX = 140;
    const centerY = 140;
    const maxRadius = 85;
    const levels = [25, 50, 75, 100];

    const getPointOnCircle = (angle: number, radius: number) => {
        const radian = (angle - 90) * (Math.PI / 180);
        return {
            x: centerX + radius * Math.cos(radian),
            y: centerY + radius * Math.sin(radian)
        };
    };

    const angleStep = 360 / skills.length;

    const polygonPoints = skills.map((skill, i) => {
        const angle = i * angleStep;
        const radius = (skill.score / 100) * maxRadius;
        const point = getPointOnCircle(angle, radius);
        return `${point.x},${point.y}`;
    }).join(' ');

    return (
        <div className="relative">
            <svg
                viewBox="0 0 280 280"
                role="img"
                aria-label="Team skill radar chart breakdown"
                className="w-full h-full max-w-[280px] mx-auto overflow-visible"
            >
                {/* Grid Circles */}
                {levels.map((level) => (
                    <circle
                        key={level}
                        cx={centerX}
                        cy={centerY}
                        r={(level / 100) * maxRadius}
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="1"
                    />
                ))}

                {/* Axis Lines */}
                {skills.map((_, i) => {
                    const angle = i * angleStep;
                    const endPoint = getPointOnCircle(angle, maxRadius);
                    return (
                        <line
                            key={i}
                            x1={centerX}
                            y1={centerY}
                            x2={endPoint.x}
                            y2={endPoint.y}
                            stroke="#e2e8f0"
                            strokeWidth="1"
                        />
                    );
                })}

                {/* Skill Polygon */}
                <motion.polygon
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    points={polygonPoints}
                    fill="rgba(6, 182, 212, 0.16)"
                    stroke="rgb(8, 145, 178)"
                    strokeWidth="2"
                />

                {/* Skill Labels */}
                {skills.map((skill, i) => {
                    const angle = i * angleStep;
                    const labelPoint = getPointOnCircle(angle, maxRadius + 18);
                    return (
                        <g key={skill.name}>
                            <text
                                x={labelPoint.x}
                                y={labelPoint.y - 6}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="text-[10px] fill-cyan-700 font-bold"
                            >
                                {skill.icon}
                            </text>
                            <text
                                x={labelPoint.x}
                                y={labelPoint.y + 7}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="text-[9px] fill-[#475569] font-semibold"
                            >
                                {skill.name}
                            </text>
                        </g>
                    );
                })}
            </svg>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-3 mt-4">
                {skills.map((skill) => (
                    <div key={skill.name} className="flex items-center gap-1.5 text-xs">
                        <span className="font-bold text-cyan-700">{skill.icon}</span>
                        <span className="text-[#334155] font-medium">{skill.name}:</span>
                        <span className={`font-bold ${skill.score >= 80 ? 'text-emerald-700' : skill.score >= 50 ? 'text-amber-700' : 'text-rose-700'}`}>
                            {skill.score}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
