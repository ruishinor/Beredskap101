import React, { useState, useEffect } from 'react';
import { KnowledgePillar } from '../../data/knowledgeMapData';

interface ConnectorLayerProps {
  pillars: KnowledgePillar[];
  activePillarId: string | null;
  hoveredPillarId: string | null;
  completedTopics: string[];
  pillarTopicsMap: Record<string, string[]>;
  hubCenterX: number;
  hubCenterY: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  hubRef: React.RefObject<HTMLButtonElement | null>;
  cardRefs: React.MutableRefObject<Record<string, HTMLButtonElement | null>>;
}

export default function ConnectorLayer({
  pillars,
  activePillarId,
  hoveredPillarId,
  completedTopics,
  pillarTopicsMap,
  hubCenterX,
  hubCenterY,
  containerRef,
  hubRef,
  cardRefs,
}: ConnectorLayerProps) {
  const [positions, setPositions] = useState<
    Record<string, { startX: number; startY: number; endX: number; endY: number }>
  >({});

  const hubRadius = 80;
  const cardWidth = 240;

  useEffect(() => {
    const measure = () => {
      if (!containerRef.current || !hubRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const hubRect = hubRef.current.getBoundingClientRect();

      const hubX = hubRect.left - containerRect.left + hubRect.width / 2;
      const hubY = hubRect.top - containerRect.top + hubRect.height / 2;
      const computedHubRadius = hubRect.width / 2;

      const newPositions: typeof positions = {};

      pillars.forEach((pillar) => {
        const cardEl = cardRefs.current[pillar.id];
        if (cardEl) {
          const cardRect = cardEl.getBoundingClientRect();
          const cardX = cardRect.left - containerRect.left + cardRect.width / 2;
          const cardY = cardRect.top - containerRect.top + cardRect.height / 2;

          const angle = Math.atan2(cardY - hubY, cardX - hubX);
          const startX = hubX + computedHubRadius * Math.cos(angle);
          const startY = hubY + computedHubRadius * Math.sin(angle);

          // Connect directly to the closest vertical edge of the card
          const endX =
            cardX < hubX
              ? cardRect.right - containerRect.left
              : cardRect.left - containerRect.left;
          const endY = cardY;

          newPositions[pillar.id] = { startX, startY, endX, endY };
        }
      });

      setPositions(newPositions);
    };

    measure();

    // Listen for resize changes on container
    if (!containerRef.current) return;
    const observer = new ResizeObserver(() => {
      measure();
    });
    observer.observe(containerRef.current);

    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [pillars, containerRef, hubRef, cardRefs]);

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{ overflow: 'visible' }}
      aria-hidden="true"
    >
      {pillars.map((pillar) => {
        // Fallback calculations in case measuring hasn't run yet
        const cardX = hubCenterX + pillar.xOffset;
        const cardY = hubCenterY + pillar.yOffset;
        const angle = Math.atan2(cardY - hubCenterY, cardX - hubCenterX);

        const fallbackStartX = hubCenterX + hubRadius * Math.cos(angle);
        const fallbackStartY = hubCenterY + hubRadius * Math.sin(angle);
        const fallbackEndX = cardX < hubCenterX ? cardX + cardWidth / 2 : cardX - cardWidth / 2;
        const fallbackEndY = cardY;

        const pos = positions[pillar.id] || {
          startX: fallbackStartX,
          startY: fallbackStartY,
          endX: fallbackEndX,
          endY: fallbackEndY,
        };

        const isActive = activePillarId === pillar.id;
        const isHovered = hoveredPillarId === pillar.id;

        // Visited if at least one topic in the pillar is marked as completed
        const topicIds = pillarTopicsMap[pillar.id] || [];
        const isVisited = topicIds.length > 0 && topicIds.some((id) => completedTopics.includes(id));

        // SVG Bezier control points for S-curve
        const cx1 = pos.startX + (pos.endX - pos.startX) / 2;
        const cy1 = pos.startY;
        const cx2 = pos.endX - (pos.endX - pos.startX) / 2;
        const cy2 = pos.endY;

        const pathD = `M ${pos.startX} ${pos.startY} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${pos.endX} ${pos.endY}`;

        // Determine connector colors and widths
        let strokeColor = 'var(--border-muted)';
        let strokeWidth = 1.5;
        let shadowClass = '';

        if (isActive) {
          strokeColor = 'var(--accent)';
          strokeWidth = 2.5;
          shadowClass = 'drop-shadow-[0_0_6px_var(--accent)]';
        } else if (isHovered) {
          strokeColor = 'var(--accent-hover)';
          strokeWidth = 2.0;
        } else if (isVisited) {
          strokeColor = 'rgba(16, 185, 129, 0.4)'; // Emerald visited line
          strokeWidth = 1.5;
        }

        return (
          <g key={`path-${pillar.id}`}>
            {/* Main curved connection line */}
            <path
              d={pathD}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              className={`transition-all duration-300 ${shadowClass}`}
            />

            {/* Hub Endpoint node dot */}
            <circle
              cx={pos.startX}
              cy={pos.startY}
              r={isActive ? 4 : isHovered ? 3.5 : isVisited ? 3 : 2}
              fill={isActive ? 'var(--accent)' : isHovered ? 'var(--accent-hover-dot)' : isVisited ? '#10b981' : 'var(--border-muted)'}
              className="transition-all duration-300"
            />

            {/* Card Endpoint node dot */}
            <circle
              cx={pos.endX}
              cy={pos.endY}
              r={isActive ? 5 : isHovered ? 4.5 : isVisited ? 4 : 3}
              fill={isActive ? 'var(--accent)' : isHovered ? 'var(--accent-hover-dot)' : isVisited ? '#10b981' : 'var(--border-muted)'}
              className="transition-all duration-300"
              style={isActive ? { filter: 'drop-shadow(0 0 4px var(--accent))' } : undefined}
            />
          </g>
        );
      })}
    </svg>
  );
}
