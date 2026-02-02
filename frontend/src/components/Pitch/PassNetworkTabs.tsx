import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Star, Filter } from 'lucide-react'
import PassNetworkMainInfo from './PassNetworkMainInfo'
import PassNetworkFilters from './PassNetworkFilters'

interface PassNetworkTabsProps {
  teamId: string
}

const PassNetworkTabs: React.FC<PassNetworkTabsProps> = ({ teamId }) => {
  return (
    <Tabs defaultValue="highlights" className="h-full flex flex-col">
      <div className="flex-shrink-0 bg-slate-900/50  px-3 py-2">
        <TabsList className="w-full bg-slate-800">
          <TabsTrigger 
            value="highlights" 
            className="flex-1 text-slate-400 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all"
          >
            <Star className="w-4 h-4 mr-1.5" />
            Destacados
          </TabsTrigger>
          <TabsTrigger 
            value="filters"
            className="flex-1 text-slate-400 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all"
          >
            <Filter className="w-4 h-4 mr-1.5" />
            Filtros
          </TabsTrigger>
        </TabsList>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <TabsContent value="highlights" className="m-0 h-full">
          <PassNetworkMainInfo teamId={teamId} />
        </TabsContent>
        
        <TabsContent value="filters" className="m-0 h-full">
          <PassNetworkFilters teamId={teamId} />
        </TabsContent>
      </div>
    </Tabs>
  )
}

export default PassNetworkTabs
