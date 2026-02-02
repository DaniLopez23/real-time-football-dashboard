import React from "react";
import OptaPitch from "@/components/Pitch/OptaPitch";
import NetworkPassPitch from "@/components/Pitch/PassNetworkPitch";
import PassNetworkTabs from "@/components/Pitch/PassNetworkTabs";

const DashboardLayout: React.FC = () => {
  return (
    <div className="h-screen w-full bg-slate-950">
      {/* Grid Container */}
      <div className="h-full flex flex-col p-4 gap-2 overflow-auto">
        {/* Fila 1: 3 columnas - 40% de altura */}
        <div className="grid grid-cols-12 gap-2 min-h-[40vh]">
          {/* Columna 1 - Grande */}
          <div className="col-span-4 bg-slate-900 rounded-lg border border-slate-800 p-4">
            <h2 className="text-white text-lg font-semibold mb-2">Panel 1</h2>
            <p className="text-slate-400">Contenido de la primera columna</p>
          </div>

          {/* Columna 2 - Pequeña */}
          <div className="col-span-4 bg-slate-900 rounded-lg border border-slate-800 p-4">
            <h2 className="text-white text-lg font-semibold mb-2">Panel 2</h2>
            <p className="text-slate-400">Contenido de la segunda columna</p>
          </div>

          {/* Columna 3 - Grande */}
          <div className="col-span-4 bg-slate-900 rounded-lg border border-slate-800 p-4">
            <h2 className="text-white text-lg font-semibold mb-2">Panel 3</h2>
            <p className="text-slate-400">Contenido de la tercera columna</p>
          </div>
        </div>

        {/* Fila 2: 2 columnas (mitad y mitad) - 60% de altura */}
        <div className="grid grid-cols-2 gap-2 min-h-[55vh]">
          {/* Columna 1 - Mitad */}
          <div className="bg-slate-900 rounded-lg border border-slate-800 p-4 flex flex-col">
            <h2 className="text-white text-sm font-semibold mb-2 flex-shrink-0">
              Campograma de eventos
            </h2>
            <div className="flex-1 min-h-0">
              <OptaPitch width={550} height={400} />
            </div>
          </div>

          {/* Columna 2 - Mitad con 2 filas internas */}
          <div className="grid grid-rows-2 gap-2">
            {/* Subfila 1 */}
            <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden flex min-h-0">
              <div className="flex-shrink-0 p-4">
                <div className="text-white text-sm font-semibold mb-2">Red de pases equipo: A</div>
                <NetworkPassPitch teamId="1564" width={350} height={200} />
              </div>
              <div className="flex-1 min-w-0 bg-slate-800/30 border-l-2 border-slate-700 flex">
                <PassNetworkTabs teamId="1564" />
              </div>
            </div>

            {/* Subfila 2 */}
            <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden flex min-h-0">
              <div className="flex-shrink-0 p-4">
                <div className="text-white text-sm font-semibold mb-2">Red de pases equipo: B</div>
                <NetworkPassPitch teamId="184" width={350} height={200} />
              </div>
              <div className="flex-1 min-w-0 bg-slate-800/30 border-l-2 border-slate-700 flex">
                <PassNetworkTabs teamId="184" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
