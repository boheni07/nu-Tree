import React, { useState } from 'react';
import { APIProvider, Map, Marker, InfoWindow } from '@vis.gl/react-google-maps';
import { useQuery } from '@tanstack/react-query';
import { fetchTrees } from '../services/api';
import TreeDetailModal from './TreeDetailModal';

// 실제 사용시에는 구글 지도 API 키가 필요함
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

function getMarkerColor(species) {
  switch (species?.toLowerCase()) {
    case '은행나무': return '#FACC15'; // yellow-400
    case '벚나무': return '#F472B6'; // pink-400
    case '이팝나무': return '#FFFFFF'; // white
    default: return '#22C55E'; // green-500
  }
}

// WKT POINT(lon lat) 파싱 유틸리티
function parseWKTPoint(wkt) {
  if (!wkt || typeof wkt !== 'string') return null;
  const match = wkt.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i);
  if (match) {
    return {
      lng: parseFloat(match[1]),
      lat: parseFloat(match[2])
    };
  }
  return null;
}

const MapDashboard = () => {
  const [selectedTreeId, setSelectedTreeId] = useState(null);
  const [hoveredTree, setHoveredTree] = useState(null);

  // React Query를 통한 가로수 목록 패칭
  const { data: trees = [], isLoading, isError } = useQuery({
    queryKey: ['trees'],
    queryFn: fetchTrees,
  });

  // API 키가 유효하지 않거나 없을 때 표시할 화면
  if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY.includes('dummy') || GOOGLE_MAPS_API_KEY.includes('your_')) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-slate-800 text-white p-6 text-center">
        <div className="text-6xl mb-4">🗺️</div>
        <h2 className="text-2xl font-bold mb-2">Google Maps API 키가 필요합니다</h2>
        <p className="text-slate-400 mb-6 max-w-md">
          지도를 표시하려면 유효한 Google Maps API Key가 필요합니다.<br/>
          <code>web/.env</code> 파일에 <code>VITE_GOOGLE_MAPS_API_KEY</code>를 설정해주세요.
        </p>
        <div className="bg-slate-700 p-4 rounded-lg text-sm font-mono text-left">
          VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
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

        <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
          <Map
            defaultCenter={{ lat: 37.5665, lng: 126.9780 }} // 서울 중심점
            defaultZoom={12}
            gestureHandling={'greedy'}
            disableDefaultUI={false}
            mapId={'DEMO_MAP_ID'} // 실제 구현시 유효한 Map ID 필요
          >
            {trees.map((tree) => {
              const coords = parseWKTPoint(tree.geom) || {
                lng: 126.9780 + (Math.random() - 0.5) * 0.1,
                lat: 37.5665 + (Math.random() - 0.5) * 0.1
              };

              return (
                <Marker
                  key={tree.tree_id}
                  position={coords}
                  onClick={() => setSelectedTreeId(tree.tree_id)}
                  onMouseOver={() => setHoveredTree(tree)}
                  onMouseOut={() => setHoveredTree(null)}
                />
              )
            })}

            {hoveredTree && (
              <InfoWindow
                position={parseWKTPoint(hoveredTree.geom) || { lat: 0, lng: 0 }}
                onCloseClick={() => setHoveredTree(null)}
              >
                <div className="text-xs text-slate-800 p-1">
                  <strong>{hoveredTree.species || '가로수'}</strong>
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>
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
