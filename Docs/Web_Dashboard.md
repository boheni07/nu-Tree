## **\[분야 7\] 웹 대시보드 프론트엔드 연동 가이드 (Web\_Dashboard.md)**

### **1\. 기능 개요**

* **지도 시각화:** 수집된 가로수 데이터를 지도상의 마커로 표시하고, 수종에 따라 마커 아이콘이나 색상을 구분합니다.  
* **상세 정보 표시:** 마커 클릭 시 해당 가로수의 사진, 센서 데이터, AI 분석 결과(수고, 흉고직경 등)를 사이드바나 모달로 출력합니다.

### **2\. 핵심 기술 스택**

* **Library:** React.js / Tailwind CSS  
* **Map Engine:** Mapbox GL JS 또는 Kakao Maps API  
* **State Management:** TanStack Query (데이터 패칭 및 캐싱)

### **3\. 지도 마커 연동 코드 예시 (React)**

JavaScript

import React, { useEffect, useState } from 'react';  
import Map, { Marker, NavigationControl } from 'react-map-gl';

const TreeDashboard \= () \=\> {  
  const \[trees, setTrees\] \= useState(\[\]);  
  const \[selectedTree, setSelectedTree\] \= useState(null);

  // 서버로부터 가로수 목록 수신  
  useEffect(() \=\> {  
    fetch('/api/v1/trees')  
      .then(res \=\> res.json())  
      .then(data \=\> setTrees(data));  
  }, \[\]);

  return (  
    \<div className\="flex h-screen"\>  
      {/\* 지도 영역 \*/}  
      \<div className\="flex-1"\>  
        \<Map  
          initialViewState\={{ longitude: 127.0, latitude: 37.5, zoom: 14 }}  
          mapStyle\="mapbox://styles/mapbox/streets-v11"  
        \>  
          {trees.map(tree \=\> (  
            \<Marker  
              key\={tree.id}  
              longitude\={tree.longitude}  
              latitude\={tree.latitude}  
              onClick\={e \=\> {  
                e.originalEvent.stopPropagation();  
                setSelectedTree(tree);  
              }}  
            \>  
              \<div className\={\`p-2 rounded-full ${getMarkerColor(tree.species)}\`}\>  
                🌳  
              \</div\>  
            \</Marker\>  
          ))}  
          \<NavigationControl /\>  
        \</Map\>  
      \</div\>

      {/\* 상세 정보 사이드바 \*/}  
      {selectedTree && (  
        \<div className\="w-80 p-4 border-l overflow-y-auto"\>  
          \<h2 className\="text-xl font-bold"\>{selectedTree.species}\</h2\>  
          \<img src\={selectedTree.photo\_url} alt\="가로수" className\="mt-2 rounded" /\>  
          \<div className\="mt-4 space-y-2"\>  
            \<p\>\<strong\>수고:\</strong\> {selectedTree.height} m\</p\>  
            \<p\>\<strong\>흉고직경:\</strong\> {selectedTree.dbh} cm\</p\>  
            \<p\>\<strong\>수관폭:\</strong\> {selectedTree.crown\_width} m\</p\>  
            \<hr /\>  
            \<p className\="text-sm text-gray-500"\>\<strong\>촬영자 좌표:\</strong\> {selectedTree.user\_location}\</p\>  
            \<p className\="text-sm text-gray-500"\>\<strong\>센서 데이터:\</strong\> Pitch({selectedTree.pitch}°)\</p\>  
          \</div\>  
          \<button   
            onClick\={() \=\> setSelectedTree(null)}  
            className="mt-6 w-full bg-blue-500 text-white py-2 rounded"  
          \>  
            닫기  
          \</button\>  
        \</div\>  
      )}  
    \</div\>  
  );  
};

export default TreeDashboard;

