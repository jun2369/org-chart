import { useState, useEffect } from 'react';
import { RegionList } from './components/RegionList';
import { OrgChart } from './components/OrgChart';
import { loadRegions } from './utils/regionStorage';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState<'regions' | 'chart'>('regions');
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);

  useEffect(() => {
    // Initialize regions if needed
    loadRegions();
  }, []);

  const handleSelectRegion = (regionId: string) => {
    setSelectedRegionId(regionId);
    setCurrentView('chart');
  };

  const handleBack = () => {
    setCurrentView('regions');
    setSelectedRegionId(null);
  };

  return (
    <div className="App">
      {currentView === 'regions' ? (
        <RegionList onSelectRegion={handleSelectRegion} />
      ) : selectedRegionId ? (
        <OrgChart regionId={selectedRegionId} onBack={handleBack} />
      ) : null}
    </div>
  );
}

export default App;

