import React, { useState } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useQuery } from '@tanstack/react-query';
import { fetchTrees } from '../services/api';
import TreeDetailModal from './TreeDetailModal';

// 실제 사용시에는 Mapbox 토큰이 필요함
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN; 

function getMarkerColor(species) {
  switch (species?.toLowerCase()) {
    case '은행나무': return 'bg-yellow-400';
    case '벚나무': return 'bg-pink-400';
    case '이팝나무': return 'bg-white border-2 border-green-500';
    default: return 'bg-green-500';
  }
}

// WKT POINT(lon lat) 파싱 유틸리티
function parseWKTPoint(wkt) {
  if (!wkt || typeof wkt !== 'string') return null;
  const match = wkt.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i);
  if (match) {
    return {
      longitude: parseFloat(match[1]),
      latitude: parseFloat(match[2])
    };
  }
  return null;
}

const MapDashboard = () => {
  const [selectedTreeId, setSelectedTreeId] = useState(null);

  // React Query를 통한 가로수 목록 패칭
  const { data: trees = [], isLoading, isError } = useQuery({
    queryKey: ['trees'],
    queryFn: fetchTrees,
  });

  // 토큰이 유효하지 않거나 없을 때 표시할 화면
  if (!MAPBOX_TOKEN || MAPBOX_TOKEN.includes('dummy')) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-slate-800 text-white p-6 text-center">
        <div className="text-6xl mb-4">🗺️</div>
        <h2 className="text-2xl font-bold mb-2">Mapbox 토큰이 필요합니다</h2>
        <p className="text-slate-400 mb-6 max-w-md">
          지도를 표시하려면 유효한 Mapbox Access Token이 필요합니다.<br/>
          <code>web/.env</code> 파일에 <code>VITE_MAPBOX_TOKEN</code>을 설정해주세요.
        </p>
        <div className="bg-slate-700 p-4 rounded-lg text-sm font-mono text-left">
          VITE_MAPBOX_TOKEN=your_token_here
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full relative">
      <div className="flex-1 h-full font-sans">
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center font-bold text-lg">
            위치 데이터를 불러오는 중...
          </div>
        )}
        {isError && (
          <div className="absolute top-4 left-4 bg-red-100 text-red-600 px-4 py-2 rounded z-10 shadow">
            서버와 연결할 수 없습니다. 백엔드 실행 상태를 확인해주세요.
          </div>
        )}

        <Map
          initialViewState={{
            longitude: 126.9780, // 서울 중심점
            latitude: 37.5665,
            zoom: 12
          }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          mapboxAccessToken={MAPBOX_TOKEN}
        >
          {trees.map((tree) => {
            // WKT 데이터 또는 기본 좌표 사용
            const coords = parseWKTPoint(tree.geom) || {
              longitude: 126.9780 + (Math.random() - 0.5) * 0.1,
              latitude: 37.5665 + (Math.random() - 0.5) * 0.1
            };

            return (
              <Marker
                key={tree.tree_id}
                longitude={coords.longitude}
                latitude={coords.latitude}
                anchor="bottom"
                onClick={e => {
                  e.originalEvent.stopPropagation();
                  setSelectedTreeId(tree.tree_id);
                }}
              >
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xl cursor-pointer shadow-lg transform hover:scale-110 transition-transform ${getMarkerColor(tree.species)}`}
                  title={tree.species}
                >
                  🌳
                </div>
              </Marker>
            )
          })}
          <NavigationControl position="bottom-right" />
        </Map>
      </div>

      {/* 오른쪽 상세 정보 모달(사이드바) */}
      {selectedTreeId && (
        <TreeDetailModal 
          treeId={selectedTreeId} 
          onClose={() => setSelectedTreeId(null)} 
        />
      )}
    </div>
  );
};

export default MapDashboard;
