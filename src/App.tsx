
import { DashboardLayout } from './components/DashboardLayout';
import { KPIGrid } from './components/KPIGrid';
import { ComplianceChart } from './components/ComplianceChart';
import { VillageTable } from './components/VillageTable';
import { useStore } from './lib/store';

function App() {
  const { districts } = useStore();

  return (
    <DashboardLayout>
      {districts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[500px] bg-white rounded-xl border-2 border-dashed border-gray-300">
          <h2 className="text-xl font-semibold text-gray-700">No Data Loaded</h2>
          <p className="text-gray-500 mt-2">Please upload the "DLS - Check List.xlsx" file to get started.</p>
        </div>
      ) : (
        <>
          <KPIGrid />
          <div className="mt-6">
            <ComplianceChart />
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Detailed Village Report</h3>
            <VillageTable />
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

export default App;
