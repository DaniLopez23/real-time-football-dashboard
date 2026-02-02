import React from 'react'

interface PassNetworkFiltersProps {
  teamId: string
}

const PassNetworkFilters: React.FC<PassNetworkFiltersProps> = ({ teamId }) => {
  return (
    <div className="p-4">
      <p className="text-slate-400 text-sm">Filtros próximamente...</p>
    </div>
  )
}

export default PassNetworkFilters
