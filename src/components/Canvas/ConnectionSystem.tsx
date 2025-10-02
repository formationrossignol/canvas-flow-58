import { useState, useCallback } from 'react';
import { CanvasElement } from './Canvas';

export interface Connection {
  id: string;
  fromElementId: string;
  toElementId: string;
  fromPoint: { x: number; y: number };
  toPoint: { x: number; y: number };
  color: string;
}

interface ConnectionSystemProps {
  elements: CanvasElement[];
  connections: Connection[];
  onUpdateConnections: (connections: Connection[]) => void;
  canvasTransform: { x: number; y: number; scale: number };
  isConnecting: boolean;
  setIsConnecting: (connecting: boolean) => void;
}

export const ConnectionSystem = ({
  elements,
  connections,
  onUpdateConnections,
  canvasTransform,
  isConnecting,
  setIsConnecting,
}: ConnectionSystemProps) => {
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [tempConnection, setTempConnection] = useState<{ x: number; y: number } | null>(null);

  const handleElementClick = useCallback((elementId: string, e: React.MouseEvent) => {
    if (!isConnecting) return;
    
    e.stopPropagation();
    
    if (!connectingFrom) {
      setConnectingFrom(elementId);
    } else if (connectingFrom !== elementId) {
      // Create connection
      const fromElement = elements.find(el => el.id === connectingFrom);
      const toElement = elements.find(el => el.id === elementId);
      
      if (fromElement && toElement) {
        const newConnection: Connection = {
          id: `connection-${Date.now()}`,
          fromElementId: connectingFrom,
          toElementId: elementId,
          fromPoint: {
            x: fromElement.x + fromElement.width / 2,
            y: fromElement.y + fromElement.height / 2,
          },
          toPoint: {
            x: toElement.x + toElement.width / 2,
            y: toElement.y + toElement.height / 2,
          },
          color: '#6366F1',
        };
        
        onUpdateConnections([...connections, newConnection]);
      }
      
      setConnectingFrom(null);
      setIsConnecting(false);
      setTempConnection(null);
    }
  }, [isConnecting, connectingFrom, elements, connections, onUpdateConnections, setIsConnecting]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isConnecting || !connectingFrom) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - canvasTransform.x) / canvasTransform.scale;
    const y = (e.clientY - rect.top - canvasTransform.y) / canvasTransform.scale;
    
    setTempConnection({ x, y });
  }, [isConnecting, connectingFrom, canvasTransform]);

  const renderArrow = (connection: Connection | { fromPoint: { x: number; y: number }; toPoint: { x: number; y: number }; color: string }) => {
    const { fromPoint, toPoint, color } = connection;
    const dx = toPoint.x - fromPoint.x;
    const dy = toPoint.y - fromPoint.y;
    const angle = Math.atan2(dy, dx);
    const length = Math.sqrt(dx * dx + dy * dy);
    
    // Arrow head size
    const arrowSize = 10;
    const arrowAngle = Math.PI / 6;
    
    return (
      <g key={'id' in connection ? connection.id : 'temp'}>
        {/* Main line */}
        <line
          x1={fromPoint.x}
          y1={fromPoint.y}
          x2={toPoint.x}
          y2={toPoint.y}
          stroke={color}
          strokeWidth="2"
          markerEnd="url(#arrowhead)"
        />
        
        {/* Arrow head */}
        <polygon
          points={`
            ${toPoint.x},${toPoint.y}
            ${toPoint.x - arrowSize * Math.cos(angle - arrowAngle)},${toPoint.y - arrowSize * Math.sin(angle - arrowAngle)}
            ${toPoint.x - arrowSize * Math.cos(angle + arrowAngle)},${toPoint.y - arrowSize * Math.sin(angle + arrowAngle)}
          `}
          fill={color}
        />
      </g>
    );
  };

  const getUpdatedConnections = () => {
    return connections.map(connection => {
      const fromElement = elements.find(el => el.id === connection.fromElementId);
      const toElement = elements.find(el => el.id === connection.toElementId);
      
      if (fromElement && toElement) {
        return {
          ...connection,
          fromPoint: {
            x: fromElement.x + fromElement.width / 2,
            y: fromElement.y + fromElement.height / 2,
          },
          toPoint: {
            x: toElement.x + toElement.width / 2,
            y: toElement.y + toElement.height / 2,
          },
        };
      }
      
      return connection;
    });
  };

  const updatedConnections = getUpdatedConnections();

  return (
    <>
      {/* Instructions overlay */}
      {isConnecting && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-elegant animate-fade-in">
          <p className="text-sm font-medium">
            {connectingFrom 
              ? "Cliquez sur l'élément de destination" 
              : "Cliquez sur l'élément de départ"}
          </p>
        </div>
      )}
      
      <div 
        className="absolute inset-0 pointer-events-none"
        onMouseMove={handleMouseMove}
        style={{ pointerEvents: isConnecting ? 'auto' : 'none' }}
      >
        <svg className="absolute inset-0 w-full h-full overflow-visible">
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="#6366F1"
            />
          </marker>
        </defs>
        
        {/* Render existing connections */}
        {updatedConnections.map(connection => renderArrow(connection))}
        
        {/* Render temporary connection while connecting */}
        {isConnecting && connectingFrom && tempConnection && (
          (() => {
            const fromElement = elements.find(el => el.id === connectingFrom);
            if (!fromElement) return null;
            
            return renderArrow({
              fromPoint: {
                x: fromElement.x + fromElement.width / 2,
                y: fromElement.y + fromElement.height / 2,
              },
              toPoint: tempConnection,
              color: '#6366F1',
            });
          })()
        )}
      </svg>
      
        {/* Connection points overlay */}
        {isConnecting && elements.map(element => (
          <div
            key={`connection-point-${element.id}`}
            className={`absolute rounded-full border-2 transition-all pointer-events-auto cursor-pointer animate-pulse ${
              connectingFrom === element.id 
                ? 'w-6 h-6 bg-primary border-primary-foreground scale-125 shadow-glow' 
                : 'w-5 h-5 bg-background border-primary hover:scale-125 hover:shadow-soft'
            }`}
            style={{
              left: element.x + element.width / 2 - (connectingFrom === element.id ? 12 : 10),
              top: element.y + element.height / 2 - (connectingFrom === element.id ? 12 : 10),
              zIndex: 100,
            }}
            onClick={(e) => handleElementClick(element.id, e)}
          />
        ))}
      </div>
    </>
  );
};