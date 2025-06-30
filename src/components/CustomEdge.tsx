"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
} from 'reactflow';

interface CustomEdgeData {
  label: string;
  onChange: (id: string, newLabel: string) => void;
}

// Helper function to truncate text
const truncateLabel = (label: string, maxLength: number) => {
  if (!label) return '';
  if (label.length <= maxLength) {
    return label;
  }
  return `${label.substring(0, maxLength)}...`;
};

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
}: EdgeProps<CustomEdgeData>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [currentLabel, setCurrentLabel] = useState(data?.label || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isEditing]);

  const handleEdgeClick = () => {
    if (!isEditing) {
      setIsVisible(!isVisible);
    }
  };

  const handleLabelDoubleClick = () => {
    setIsEditing(true);
    setIsVisible(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (data?.onChange) {
      data.onChange(id, currentLabel);
    }
  };

  const handleInputChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentLabel(evt.target.value);
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${evt.target.scrollHeight}px`;
    }
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} />
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        className="react-flow__edge-interaction"
        onClick={handleEdgeClick}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
            display: isVisible || isEditing ? 'block' : 'none',
          }}
          className="nodrag nopan"
          onDoubleClick={handleLabelDoubleClick}
        >
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={currentLabel}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className="edge-input"
              style={{
                padding: '4px 6px',
                border: '1px solid #777',
                borderRadius: '4px',
                fontSize: '12px',
                textAlign: 'center',
                minWidth: '100px',
                resize: 'none',
                overflow: 'hidden',
              }}
              rows={1}
            />
          ) : (
            <div
              className="edge-label"
              style={{
                background: '#ffcc00',
                padding: '5px 10px',
                borderRadius: '8px',
                fontSize: '12px',
                maxWidth: '150px',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {truncateLabel(data?.label, 10) || '...'}
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
