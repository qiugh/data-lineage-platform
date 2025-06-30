"use client";

import React from 'react';

const colors = ['#555', '#ff0000', '#00ff00', '#0000ff', '#ffc107'];
const shapes = ['rectangle', 'circle', 'diamond'];

interface ContextMenuProps {
  id: string;
  top: number;
  left: number;
  onStyleChange: (id: string, style: object) => void;
  onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ id, top, left, onStyleChange, onClose }) => {
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left,
        zIndex: 1000,
        background: 'white',
        border: '1px solid #ddd',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        padding: '8px',
      }}
      onMouseLeave={onClose}
    >
      <div style={{ marginBottom: '8px' }}>
        <div style={{ fontSize: '12px', color: '#555', marginBottom: '4px' }}>Color</div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {colors.map((color) => (
            <button
              key={color}
              style={{
                width: '20px',
                height: '20px',
                background: color,
                border: '1px solid #ccc',
                borderRadius: '50%',
                cursor: 'pointer',
              }}
              onClick={() => {
                onStyleChange(id, { color });
                onClose();
              }}
            />
          ))}
        </div>
      </div>
      <div>
        <div style={{ fontSize: '12px', color: '#555', marginBottom: '4px' }}>Shape</div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {shapes.map((shape) => (
            <button
              key={shape}
              style={{
                padding: '4px 8px',
                fontSize: '12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
              onClick={() => {
                onStyleChange(id, { shape });
                onClose();
              }}
            >
              {shape}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContextMenu;
