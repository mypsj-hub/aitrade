/**
 * 시장 상황 배지
 *
 * 목적: 현재 시장 상황(상승장/하락장/횡보장)을 시각적으로 표시하기 위함
 * 역할: 시장 레짐 텍스트를 받아 색상과 아이콘이 포함된 배지로 변환
 *
 * 주요 기능:
 * - Bull_Market(상승장): 빨간색 배지 + 로켓 아이콘
 * - Bear_Market(하락장): 파란색 배지 + 하락 아이콘
 * - Range_Bound(횡보장): 노란색 배지 + 차트 아이콘
 * - 한글 레이블 자동 매핑
 * - 둥근 배지 형태로 스타일링
 *
 * Props:
 * - regime: string - 시장 상황 코드 (Bull_Market, Bear_Market, Range_Bound)
 *
 * 데이터 소스: 부모 컴포넌트에서 전달받은 regime 값
 * 기술 스택: React, Tailwind CSS
 */
interface Props {
  regime: string;
}

export function MarketRegimeBadge({ regime }: Props) {
  const getRegimeColor = (regime: string) => {
    switch (regime) {
      case 'Bull_Market':
        return 'bg-red-500 text-white';
      case 'Bear_Market':
        return 'bg-blue-500 text-white';
      case 'Range_Bound':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getRegimeLabel = (regime: string) => {
    switch (regime) {
      case 'Bull_Market':
        return '🚀 상승장';
      case 'Bear_Market':
        return '📉 하락장';
      case 'Range_Bound':
        return '📊 횡보장';
      default:
        return regime;
    }
  };

  return (
    <div className={`px-4 py-2 rounded-full font-semibold ${getRegimeColor(regime)}`}>
      {getRegimeLabel(regime)}
    </div>
  );
}
