"use client";

import { useState, useEffect, useRef } from 'react';
import { Handle, Position } from 'reactflow';

const baseHandleStyle = {
  width: '10px',
  height: '10px',
  background: '#555',
  borderRadius: '50%',
  transition: 'opacity 0.2s ease-in-out',
};

interface CustomNodeProps {
  data: {
    label: string;
    onChange: (id: string, newLabel: string) => void;
    style: {
      color: string;
      shape: string;
    };
  };
  id: string;
}

function getShapeStyles(shape: string) {
  switch (shape) {
    case 'circle':
      return { borderRadius: '50%' };
    case 'diamond':
      return { transform: 'rotate(45deg)', width: '100px', height: '100px' };
    default:
      return { borderRadius: '8px' };
  }
}

function CustomNode({ data, id }: CustomNodeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [currentLabel, setCurrentLabel] = useState(data.label);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => setIsEditing(true);
  const handleBlur = () => {
    setIsEditing(false);
    data.onChange(id, currentLabel);
  };
  const handleInputChange = (evt: React.ChangeEvent<HTMLInputElement>) => setCurrentLabel(evt.target.value);
  const handleKeyDown = (evt: React.KeyboardEvent<HTMLInputElement>) => {
    if (evt.key === 'Enter') {
      setIsEditing(false);
      data.onChange(id, currentLabel);
    }
  };

  const shapeStyles = getShapeStyles(data.style.shape);
  const handleOpacity = { opacity: isHovered ? 1 : 0 };

  return (
    <div
      style={{
        ...shapeStyles,
        border: `1px solid ${data.style.color}`,
        padding: '10px 15px',
        background: '#fff',
        minWidth: '150px',
        maxWidth: '400px',
        textAlign: 'center',
        position: 'relative',
      }}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Handle type="target" position={Position.Top} style={{ ...baseHandleStyle, ...handleOpacity, top: '-5px' }} />
      
      {isEditing ? (
        <div style={data.style.shape === 'diamond' ? { transform: 'rotate(-45deg)' } : {}}>
          <input
            ref={inputRef}
            value={currentLabel}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="nodrag"
            style={{ width: '100%', border: '1px solid #777', padding: '4px', textAlign: 'center', borderRadius: '4px' }}
          />
        </div>
      ) : (
        <div style={data.style.shape === 'diamond' ? { transform: 'rotate(-45deg)' } : {}}>
          <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', padding: '5px 0' }}>
            {data.label || '...'}
          </div>
        </div>
      )}
      
      <Handle type="source" position={Position.Bottom} style={{ ...baseHandleStyle, ...handleOpacity, bottom: '-5px' }} />
    </div>
  );
}

export default CustomNode;
