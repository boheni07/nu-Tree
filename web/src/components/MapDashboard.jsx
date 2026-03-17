import React, { useState } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useQuery } from '@tanstack/react-query';
import { fetchTrees } from '../services/api';
import TreeDetailModal from './TreeDetailModal';

// 실제 사용시에는 Mapbox 토큰이 필요함
const MAPBOX_TOKEN = 'pk.eyJ1IjoiZHVtbXkiLCJhIjoiY2R1bW15In0.dummy'; 

function getMarkerColor(species) {
  switch (species?.toLowerCase()) {
    case '은행나무': return 'bg-yellow-400';
    case '벚나무': return 'bg-pink-400';
    case '이팝나무': return 'bg-white border-2 border-green-500';
    default: return 'bg-green-500';
  }
}

const MapDashboard = () => {
  const [selectedTreeId, setSelectedTreeId] = useState(null);

  // React Query를 통한 가로수 목록 패칭
  const { data: trees = [], isLoading, isError } = useQuery({
    queryKey: ['trees'],
    queryFn: fetchTrees,
  });

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
            // 임시 파싱 로직 (String -> JSON 변환이 필요한 경우 처리)
            let lon = 126.9780 + (Math.random() - 0.5) * 0.1; // 테스트용 랜덤 좌표
            let lat = 37.5665 + (Math.random() - 0.5) * 0.1;
            
            // 실제 구현 시에는 tree.geom 파싱 등의 로직 필요

            return (
              <Marker
                key={tree.tree_id}
                longitude={lon}
                latitude={lat}
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
