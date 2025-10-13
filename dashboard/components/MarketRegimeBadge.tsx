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
