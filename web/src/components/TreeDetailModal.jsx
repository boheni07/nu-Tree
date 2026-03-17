import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTreeDetail } from '../services/api';
import { X, Ruler, Target, Camera } from 'lucide-react';

const TreeDetailModal = ({ treeId, onClose }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['treeDetail', treeId],
    queryFn: () => fetchTreeDetail(treeId),
    enabled: !!treeId,
  });

  if (isLoading) {
    return (
      <div className="w-80 h-full border-l bg-gray-50 p-4 shadow-xl flex items-center justify-center">
        <span className="animate-pulse text-gray-500">데이터를 불러오는 중...</span>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="w-80 h-full border-l bg-white p-4 shadow-xl">
        <div className="flex justify-between items-center mb-4 text-red-500">
          <span>정보를 불러올 수 없습니다.</span>
          <button onClick={onClose}><X size={20} /></button>
        </div>
      </div>
    );
  }

  const { tree, details } = data;

  return (
    <div className="w-96 h-full border-l bg-white flex flex-col shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
      {/* 헤더 */}
      <div className="flex justify-between items-center p-4 border-b bg-green-50">
        <div>
          <h2 className="text-xl font-bold text-gray-800">{tree.species || '수종 미상'}</h2>
          <span className="text-xs text-gray-500 font-mono mt-1">{tree.id}</span>
        </div>
        <button 
          onClick={onClose}
          className="p-1 rounded-full hover:bg-green-200 transition-colors"
        >
          <X size={20} className="text-gray-600" />
        </button>
      </div>

      {/* 내용 영역 */}
      <div className="p-4 flex-1 space-y-6">
        {/* 임시 사진 영역 */}
        <div className="aspect-[4/3] bg-gray-100 rounded-lg flex flex-col items-center justify-center border border-gray-200 shadow-inner">
           <Camera size={32} className="text-gray-400 mb-2" />
           <span className="text-sm text-gray-500">사진 데이터 없음</span>
        </div>

        {/* 종합 수치 결과 (Master Data) */}
        <div>
          <h3 className="flex items-center text-sm font-semibold text-gray-700 mb-3 border-b pb-1">
            <Ruler size={16} className="mr-2 text-blue-500" />
            최종 확정 수치
          </h3>
          <div className="grid grid-cols-2 gap-3">
             <div className="bg-blue-50 p-3 rounded-md text-center">
                <div className="text-xs text-blue-600 font-medium">수고</div>
                <div className="text-lg font-bold text-gray-800">- m</div>
             </div>
             <div className="bg-amber-50 p-3 rounded-md text-center">
                <div className="text-xs text-amber-600 font-medium">흉고직경</div>
                <div className="text-lg font-bold text-gray-800">- cm</div>
             </div>
          </div>
        </div>

        {/* 측정 이력 / 기록 (Collection & Estimation) */}
        <div>
           <h3 className="flex items-center text-sm font-semibold text-gray-700 mb-3 border-b pb-1">
              <Target size={16} className="mr-2 text-purple-500" />
              측정 및 분석 이력
           </h3>
           <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded border border-gray-100">
             {details}
             {/* 향후 수집 로그 및 모바일/서버 AI 산정값 비교 테이블 구성됨 */}
           </div>
        </div>
      </div>
      
      {/* 푸터 영역 */}
      <div className="p-4 border-t bg-gray-50">
         <button className="w-full bg-green-600 hover:bg-green-700 transition-colors text-white py-2.5 rounded-lg font-medium shadow-sm">
            상세 보고서 보기
         </button>
      </div>
    </div>
  );
};

export default TreeDetailModal;
