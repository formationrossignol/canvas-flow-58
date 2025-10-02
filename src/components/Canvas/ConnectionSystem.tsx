import { useState, useCallback } from 'react';
import { CanvasElement } from './Canvas';

export interface Connection {
  id: string;
  fromElementId: string;
  toElementId: string;
  fromPoint: { x: number; y: number };
  toPoint: { x: number; y: number };
  fromSide?: 'top' | 'bottom' | 'left' | 'right';
  toSide?: 'top' | 'bottom' | 'left' | 'right';
  color: string;
}

type ConnectionPoint = {
  side: 'top' | 'bottom' | 'left' | 'right';
  x: number;
  y: number;
};

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
  const [connectingFrom, setConnectingFrom] = useState<{ elementId: string; side: 'top' | 'bottom' | 'left' | 'right' } | null>(null);
  const [tempConnection, setTempConnection] = useState<{ x: number; y: number } | null>(null);

  // Get connection points for an element
  const getConnectionPoints = (element: CanvasElement): ConnectionPoint[] => {
    return [
      { side: 'top', x: element.x + element.width / 2, y: element.y },
      { side: 'bottom', x: element.x + element.width / 2, y: element.y + element.height },
      { side: 'left', x: element.x, y: element.y + element.height / 2 },
      { side: 'right', x: element.x + element.width, y: element.y + element.height / 2 },
    ];
  };

  const handleConnectionPointClick = useCallback((elementId: string, side: 'top' | 'bottom' | 'left' | 'right', e: React.MouseEvent) => {
    if (!isConnecting) return;
    
    e.stopPropagation();
    
    if (!connectingFrom) {
      setConnectingFrom({ elementId, side });
    } else if (connectingFrom.elementId !== elementId) {
      // Create connection
      const fromElement = elements.find(el => el.id === connectingFrom.elementId);
      const toElement = elements.find(el => el.id === elementId);
      
      if (fromElement && toElement) {
        const fromPoints = getConnectionPoints(fromElement);
        const toPoints = getConnectionPoints(toElement);
        
        const fromPoint = fromPoints.find(p => p.side === connectingFrom.side);
        const toPoint = toPoints.find(p => p.side === side);
        
        if (fromPoint && toPoint) {
          const newConnection: Connection = {
            id: `connection-${Date.now()}`,
            fromElementId: connectingFrom.elementId,
            toElementId: elementId,
            fromPoint: { x: fromPoint.x, y: fromPoint.y },
            toPoint: { x: toPoint.x, y: toPoint.y },
            fromSide: connectingFrom.side,
            toSide: side,
            color: '#6366F1',
          };
          
          onUpdateConnections([...connections, newConnection]);
        }
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
        const fromPoints = getConnectionPoints(fromElement);
        const toPoints = getConnectionPoints(toElement);
        
        const fromPoint = fromPoints.find(p => p.side === connection.fromSide) || fromPoints[0];
        const toPoint = toPoints.find(p => p.side === connection.toSide) || toPoints[0];
        
        return {
          ...connection,
          fromPoint: { x: fromPoint.x, y: fromPoint.y },
          toPoint: { x: toPoint.x, y: toPoint.y },
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
              ? "Cliquez sur un point de connexion de destination" 
              : "Cliquez sur un point de connexion de départ"}
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
            const fromElement = elements.find(el => el.id === connectingFrom.elementId);
            if (!fromElement) return null;
            
            const fromPoints = getConnectionPoints(fromElement);
            const fromPoint = fromPoints.find(p => p.side === connectingFrom.side);
            
            if (!fromPoint) return null;
            
            return renderArrow({
              fromPoint: { x: fromPoint.x, y: fromPoint.y },
              toPoint: tempConnection,
              color: '#6366F1',
            });
          })()
        )}
      </svg>
      
        {/* Connection points overlay - 4 points per element */}
        {isConnecting && elements.map(element => {
          const points = getConnectionPoints(element);
          return points.map(point => {
            const isFromPoint = connectingFrom?.elementId === element.id && connectingFrom?.side === point.side;
            
            return (
              <div
                key={`connection-point-${element.id}-${point.side}`}
                className={`absolute rounded-full border-2 transition-all pointer-events-auto cursor-pointer ${
                  isFromPoint 
                    ? 'w-5 h-5 bg-primary border-primary-foreground scale-125 shadow-glow animate-pulse' 
                    : 'w-3 h-3 bg-background border-primary hover:scale-150 hover:shadow-soft'
                }`}
                style={{
                  left: point.x - (isFromPoint ? 10 : 6),
                  top: point.y - (isFromPoint ? 10 : 6),
                  zIndex: 100,
                }}
                onClick={(e) => handleConnectionPointClick(element.id, point.side, e)}
                title={`${element.id} - ${point.side}`}
              />
            );
          });
        })}
      </div>
    </>
  );
};