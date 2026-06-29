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
  strokeStyle?: 'solid' | 'dashed' | 'dotted';
  strokeWidth?: number;
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

const COLORS = ['#6366F1', '#14B8A6', '#F59E0B', '#EF4444', '#10B981', '#8B5CF6', '#EC4899', '#0F172A'];

const getStrokeDashArray = (style: Connection['strokeStyle'], width: number) => {
  if (style === 'dashed') return `${width * 4},${width * 3}`;
  if (style === 'dotted') return `${width},${width * 2}`;
  return undefined;
};

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
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);

  const selectedConnection = connections.find(c => c.id === selectedConnectionId) ?? null;

  const getConnectionPoints = (element: CanvasElement): ConnectionPoint[] => [
    { side: 'top',    x: element.x + element.width / 2, y: element.y },
    { side: 'bottom', x: element.x + element.width / 2, y: element.y + element.height },
    { side: 'left',   x: element.x,                     y: element.y + element.height / 2 },
    { side: 'right',  x: element.x + element.width,     y: element.y + element.height / 2 },
  ];

  const handleConnectionPointClick = useCallback((elementId: string, side: 'top' | 'bottom' | 'left' | 'right', e: React.MouseEvent) => {
    if (!isConnecting) return;
    e.stopPropagation();

    if (!connectingFrom) {
      setConnectingFrom({ elementId, side });
    } else if (connectingFrom.elementId !== elementId) {
      const fromElement = elements.find(el => el.id === connectingFrom.elementId);
      const toElement   = elements.find(el => el.id === elementId);
      if (fromElement && toElement) {
        const fromPoints = getConnectionPoints(fromElement);
        const toPoints   = getConnectionPoints(toElement);
        const fromPoint  = fromPoints.find(p => p.side === connectingFrom.side);
        const toPoint    = toPoints.find(p => p.side === side);
        if (fromPoint && toPoint) {
          const newConnection: Connection = {
            id: `connection-${Date.now()}`,
            fromElementId: connectingFrom.elementId,
            toElementId: elementId,
            fromPoint: { x: fromPoint.x, y: fromPoint.y },
            toPoint:   { x: toPoint.x,   y: toPoint.y },
            fromSide: connectingFrom.side,
            toSide: side,
            color: '#6366F1',
            strokeStyle: 'solid',
            strokeWidth: 2,
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
    const y = (e.clientY - rect.top  - canvasTransform.y) / canvasTransform.scale;
    setTempConnection({ x, y });
  }, [isConnecting, connectingFrom, canvasTransform]);

  const updateSelected = (patch: Partial<Connection>) => {
    if (!selectedConnectionId) return;
    onUpdateConnections(connections.map(c => c.id === selectedConnectionId ? { ...c, ...patch } : c));
  };

  const deleteSelected = () => {
    if (!selectedConnectionId) return;
    onUpdateConnections(connections.filter(c => c.id !== selectedConnectionId));
    setSelectedConnectionId(null);
  };

  const renderArrow = (
    connection: Connection | { fromPoint: { x: number; y: number }; toPoint: { x: number; y: number }; color: string; strokeStyle?: Connection['strokeStyle']; strokeWidth?: number },
    isSelected = false,
  ) => {
    const { fromPoint, toPoint, color } = connection;
    const strokeWidth = ('strokeWidth' in connection ? connection.strokeWidth : undefined) ?? 2;
    const strokeStyle = ('strokeStyle' in connection ? connection.strokeStyle : undefined) ?? 'solid';

    const dx = toPoint.x - fromPoint.x;
    const dy = toPoint.y - fromPoint.y;
    const angle    = Math.atan2(dy, dx);
    const distance = Math.sqrt(dx * dx + dy * dy);

    const controlPointOffset = distance * 0.3;
    const fromSide = 'fromSide' in connection ? connection.fromSide : undefined;
    const toSide   = 'toSide'   in connection ? connection.toSide   : undefined;

    let cp1x = fromPoint.x, cp1y = fromPoint.y;
    let cp2x = toPoint.x,   cp2y = toPoint.y;

    if (fromSide === 'right')  cp1x += controlPointOffset;
    else if (fromSide === 'left')   cp1x -= controlPointOffset;
    else if (fromSide === 'bottom') cp1y += controlPointOffset;
    else if (fromSide === 'top')    cp1y -= controlPointOffset;

    if (toSide === 'right')  cp2x += controlPointOffset;
    else if (toSide === 'left')   cp2x -= controlPointOffset;
    else if (toSide === 'bottom') cp2y += controlPointOffset;
    else if (toSide === 'top')    cp2y -= controlPointOffset;

    const path = `M ${fromPoint.x},${fromPoint.y} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${toPoint.x},${toPoint.y}`;

    const arrowSize  = 10 + strokeWidth * 2;
    const arrowAngle = Math.PI / 6;
    const dashArray  = getStrokeDashArray(strokeStyle, strokeWidth);

    const id = 'id' in connection ? connection.id : 'temp';

    return (
      <g key={id}>
        {/* Invisible wide hit area for clicking */}
        {'id' in connection && (
          <path
            d={path}
            stroke="transparent"
            strokeWidth={Math.max(16, strokeWidth * 4)}
            fill="none"
            style={{ cursor: 'pointer' }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedConnectionId(id === selectedConnectionId ? null : id);
            }}
          />
        )}

        {/* Selection glow */}
        {isSelected && (
          <path
            d={path}
            stroke={color}
            strokeWidth={strokeWidth + 6}
            fill="none"
            strokeOpacity={0.25}
            strokeLinecap="round"
          />
        )}

        {/* Main line */}
        <path
          d={path}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={dashArray}
          className="drop-shadow-sm"
          style={{ pointerEvents: 'none' }}
        />

        {/* Arrow head */}
        <polygon
          points={`
            ${toPoint.x},${toPoint.y}
            ${toPoint.x - arrowSize * Math.cos(angle - arrowAngle)},${toPoint.y - arrowSize * Math.sin(angle - arrowAngle)}
            ${toPoint.x - arrowSize * Math.cos(angle + arrowAngle)},${toPoint.y - arrowSize * Math.sin(angle + arrowAngle)}
          `}
          fill={color}
          style={{ pointerEvents: 'none' }}
        />
      </g>
    );
  };

  const getUpdatedConnections = () => connections.map(connection => {
    const fromElement = elements.find(el => el.id === connection.fromElementId);
    const toElement   = elements.find(el => el.id === connection.toElementId);
    if (fromElement && toElement) {
      const fromPoints = getConnectionPoints(fromElement);
      const toPoints   = getConnectionPoints(toElement);
      const fromPoint  = fromPoints.find(p => p.side === connection.fromSide) || fromPoints[0];
      const toPoint    = toPoints.find(p => p.side === connection.toSide)   || toPoints[0];
      return { ...connection, fromPoint: { x: fromPoint.x, y: fromPoint.y }, toPoint: { x: toPoint.x, y: toPoint.y } };
    }
    return connection;
  });

  const updatedConnections = getUpdatedConnections();

  // Midpoint of selected connection (for toolbar positioning)
  const toolbarPos = (() => {
    if (!selectedConnection) return null;
    const conn = updatedConnections.find(c => c.id === selectedConnectionId);
    if (!conn) return null;
    const mx = (conn.fromPoint.x + conn.toPoint.x) / 2;
    const my = (conn.fromPoint.y + conn.toPoint.y) / 2;
    return {
      x: canvasTransform.x + mx * canvasTransform.scale,
      y: canvasTransform.y + my * canvasTransform.scale,
    };
  })();

  return (
    <>
      {/* Connection instructions */}
      {isConnecting && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-elegant animate-fade-in pointer-events-none">
          <p className="text-sm font-medium">
            {connectingFrom ? "Cliquez sur un point de connexion de destination" : "Cliquez sur un point de connexion de départ"}
          </p>
        </div>
      )}

      {/* Click outside to deselect connection */}
      {selectedConnectionId && (
        <div
          className="absolute inset-0"
          style={{ zIndex: 5, pointerEvents: 'auto' }}
          onClick={() => setSelectedConnectionId(null)}
        />
      )}

      <div
        className="absolute inset-0"
        onMouseMove={handleMouseMove}
        style={{ pointerEvents: isConnecting ? 'auto' : 'none', zIndex: selectedConnectionId ? 6 : 'auto' }}
      >
        <svg className="absolute inset-0 w-full h-full overflow-visible">
          {/* Render connections */}
          {updatedConnections.map(connection =>
            renderArrow(connection, connection.id === selectedConnectionId)
          )}

          {/* Temp connection while connecting */}
          {isConnecting && connectingFrom && tempConnection && (() => {
            const fromElement = elements.find(el => el.id === connectingFrom.elementId);
            if (!fromElement) return null;
            const fromPoints = getConnectionPoints(fromElement);
            const fromPoint  = fromPoints.find(p => p.side === connectingFrom.side);
            if (!fromPoint) return null;
            return renderArrow({ fromPoint: { x: fromPoint.x, y: fromPoint.y }, toPoint: tempConnection, color: '#6366F1', strokeStyle: 'dashed', strokeWidth: 2 });
          })()}
        </svg>

        {/* Connection points — only in connecting mode */}
        {isConnecting && elements.map(element => {
          const points = getConnectionPoints(element);
          return points.map(point => {
            const isFrom = connectingFrom?.elementId === element.id && connectingFrom?.side === point.side;
            return (
              <div
                key={`cp-${element.id}-${point.side}`}
                className={`absolute rounded-full border-2 transition-all pointer-events-auto cursor-pointer ${
                  isFrom
                    ? 'w-6 h-6 bg-primary border-background scale-125 shadow-glow animate-pulse'
                    : 'w-4 h-4 bg-card border-primary hover:scale-150 hover:shadow-elegant hover:bg-primary/20'
                }`}
                style={{
                  left: point.x - (isFrom ? 12 : 8),
                  top:  point.y - (isFrom ? 12 : 8),
                  zIndex: 100,
                }}
                onClick={e => handleConnectionPointClick(element.id, point.side, e)}
                title={`Connexion ${point.side}`}
              />
            );
          });
        })}
      </div>

      {/* Connection toolbar — screen space, floating at midpoint */}
      {selectedConnection && toolbarPos && (
        <div
          style={{
            position: 'absolute',
            left: toolbarPos.x,
            top: toolbarPos.y - 52,
            transform: 'translateX(-50%)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 12,
            padding: '6px 10px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            pointerEvents: 'auto',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Color swatches */}
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => updateSelected({ color: c })}
                style={{
                  width: 14, height: 14, borderRadius: '50%',
                  background: c,
                  border: selectedConnection.color === c ? '2px solid hsl(var(--foreground))' : '1.5px solid rgba(0,0,0,0.15)',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              />
            ))}
          </div>

          {/* Separator */}
          <div style={{ width: 1, height: 18, background: 'hsl(var(--border))' }} />

          {/* Stroke style */}
          {(['solid', 'dashed', 'dotted'] as const).map(style => (
            <button
              key={style}
              onClick={() => updateSelected({ strokeStyle: style })}
              title={style}
              style={{
                width: 32, height: 22, borderRadius: 6, cursor: 'pointer',
                border: selectedConnection.strokeStyle === style || (!selectedConnection.strokeStyle && style === 'solid')
                  ? '2px solid hsl(var(--primary))'
                  : '1px solid hsl(var(--border))',
                background: 'hsl(var(--muted))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 4px',
              }}
            >
              <svg width="24" height="3">
                <line
                  x1="0" y1="1.5" x2="24" y2="1.5"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="2"
                  strokeDasharray={style === 'dashed' ? '5,3' : style === 'dotted' ? '1.5,3' : undefined}
                  strokeLinecap="round"
                />
              </svg>
            </button>
          ))}

          {/* Separator */}
          <div style={{ width: 1, height: 18, background: 'hsl(var(--border))' }} />

          {/* Thickness */}
          {[1, 2, 4].map(w => (
            <button
              key={w}
              onClick={() => updateSelected({ strokeWidth: w })}
              title={`${w}px`}
              style={{
                width: 26, height: 22, borderRadius: 6, cursor: 'pointer',
                border: (selectedConnection.strokeWidth ?? 2) === w
                  ? '2px solid hsl(var(--primary))'
                  : '1px solid hsl(var(--border))',
                background: 'hsl(var(--muted))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <div style={{ width: 14, height: w + 1, borderRadius: 2, background: 'hsl(var(--foreground))' }} />
            </button>
          ))}

          {/* Separator */}
          <div style={{ width: 1, height: 18, background: 'hsl(var(--border))' }} />

          {/* Delete */}
          <button
            onClick={deleteSelected}
            title="Supprimer la liaison"
            style={{
              width: 24, height: 24, borderRadius: 6, cursor: 'pointer',
              border: '1px solid hsl(var(--border))',
              background: 'hsl(var(--muted))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#EF4444',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            ×
          </button>
        </div>
      )}
    </>
  );
};
