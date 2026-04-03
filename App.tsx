
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Car, 
  Fuel, 
  Wrench, 
  DollarSign, 
  User, 
  Play, 
  Square, 
  MapPin, 
  Plus, 
  Trash2, 
  Star,
  ChevronRight,
  Calendar,
  Share2,
  AlertTriangle,
  ChevronDown,
  Camera,
  Sparkles,
  Rocket,
  TrendingUp,
  TrendingDown,
  Clock,
  Briefcase,
  Wallet,
  HelpCircle,
  X,
  Handshake,
  Utensils,
  ChevronLeft,
  CheckCircle,
  Target,
  LogOut,
  ShoppingBag,
  FileText,
  Printer,
  Building2,
  ExternalLink,
  CheckSquare,
  AlertCircle,
  Activity,
  ScanLine,
  Edit,
  Route
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
} from 'recharts';
import { getVehicleSpecs, getFinancialAdvice, getVehicleModels, getVehicleVersions, extractFuelPricesFromImage, getMaintenanceSchedule, getAddressFromCoordinates } from './services/geminiService';
import { 
  AppState, 
  UserProfile, 
  Vehicle, 
  GasStation, 
  Trip, 
  MaintenanceItem, 
  FuelType,
  ExtractedFuelPrice,
  MaintenanceScheduleItem,
  Partner,
  Expense,
  ExpenseCategory,
  Goal
} from './types';
import { Button } from './components/Button';
import { Input } from './components/Input';

// --- Vehicle Data for Faster UI ---
const popularVehicleData = {
  "Audi": ["A3", "Q3", "Q5"],
  "BMW": ["320i", "X1", "X3"],
  "BYD": ["Dolphin", "Song Plus", "Yuan Plus", "Seal"],
  "Caoa Chery": ["Tiggo 5X", "Tiggo 7", "Tiggo 8", "Arrizo 6", "Tiggo 2"],
  "Chevrolet": ["Onix", "Onix Plus", "Tracker", "Spin", "Cobalt", "S10", "Montana", "Cruze", "Celta", "Prisma", "Equinox", "Trailblazer"],
  "Citroën": ["C3", "C4 Cactus", "Aircross"],
  "Fiat": ["Strada", "Argo", "Mobi", "Toro", "Cronos", "Pulse", "Fastback", "Uno", "Palio", "Siena", "Grand Siena"],
  "Ford": ["Ka", "Ka Sedan", "EcoSport", "Ranger", "Territory", "Maverick", "Bronco"],
  "GWM": ["Haval H6", "Ora 03"],
  "Honda": ["Civic", "HR-V", "City", "City Hatch", "Fit", "WR-V", "ZR-V"],
  "Hyundai": ["HB20", "HB20S", "Creta", "Tucson", "i30"],
  "Jeep": ["Renegade", "Compass", "Commander"],
  "Kia": ["Sportage", "Cerato", "Stonic", "Niro"],
  "Mercedes-Benz": ["Classe C", "GLA", "Classe A"],
  "Mitsubishi": ["L200 Triton", "Eclipse Cross", "Outlander", "Pajero Sport"],
  "Nissan": ["Kicks", "Versa", "Frontier", "March", "Sentra"],
  "Peugeot": ["208", "2008", "3008", "207", "206"],
  "Ram": ["Rampage", "1500"],
  "Renault": ["Kwid", "Sandero", "Logan", "Duster", "Oroch", "Captur", "Clio"],
  "Toyota": ["Corolla", "Corolla Cross", "Hilux", "Yaris", "Yaris Sedan", "Etios", "RAV4", "SW4"],
  "Volkswagen": ["Gol", "Polo", "Virtus", "T-Cross", "Nivus", "Voyage", "Saveiro", "Amarok", "Jetta", "Fox", "Up!", "Taos"],
};

const allBrands = Object.keys(popularVehicleData).sort();


// --- Reusable Select Component ---

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  isLoading?: boolean;
}

const Select: React.FC<SelectProps> = ({ label, className = '', children, isLoading, ...props }) => {
  return (
    <div className="flex flex-col gap-1 w-full relative">
      <label className="text-sm text-slate-400 font-medium ml-1">{label}</label>
      <select
        className={`bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        {...props}
      >
        {children}
      </select>
      <div className="absolute right-4 top-10 pointer-events-none">
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <ChevronDown className="text-slate-400" size={20} />
        )}
      </div>
    </div>
  );
};

// --- Help Tooltip Component ---
const HelpTooltip = ({ title, content }: { title: string, content: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="text-yellow-400 hover:text-yellow-300 transition-colors p-1 rounded-full hover:bg-yellow-400/10"
        aria-label={`Ajuda sobre ${title}`}
      >
        <HelpCircle size={24} />
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="bg-slate-800 border border-slate-700 p-6 rounded-2xl w-full max-w-sm space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            <div className="flex justify-between items-center border-b border-slate-700 pb-3">
              <h3 className="text-xl font-bold text-yellow-400 flex items-center gap-2">
                <HelpCircle size={20}/> {title}
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <div className="text-slate-200 space-y-3 text-sm leading-relaxed">
              {content}
            </div>
            <Button variant="secondary" onClick={() => setIsOpen(false)} className="mt-2">Entendi</Button>
          </div>
        </div>
      )}
    </>
  );
};

const initialPartners: Partner[] = [
  { id: '4', name: 'LigaAqui Celulares', category: 'Serviços', benefit: 'Desconto em todos acessórios para carros e Celulares.', address: 'Alameda Paulista 1121', whatsapp: '5516988110338' },
  { id: '1', name: 'AutoPeças Veloz', category: 'Autopeças', benefit: '15% de desconto em freios', address: 'Rua das Peças, 123, São Paulo', whatsapp: '5511999998888' },
  { id: '2', name: 'Lava Rápido Brilhante', category: 'Serviços', benefit: 'Lavagem completa por R$40', address: 'Avenida do Brilho, 456, Rio de Janeiro', latitude: -22.9068, longitude: -43.1729 },
  { id: '3', name: 'Restaurante Sabor da Estrada', category: 'Alimentação', benefit: 'Prato do dia + Refresco grátis', address: 'Rodovia dos Sabores, km 7, Campinas', whatsapp: '551988887777' },
];

const initialState: AppState = {
  user: { firstName: '', lastName: '', userId: '', whatsapp: '', email: '', pixKey: '', isSetupComplete: false, wantsPartnerDiscounts: false, isLoggedIn: false },
  vehicles: [],
  stations: [],
  expenses: [],
  goals: [],
  partners: initialPartners,
  activeVehicleId: null,
};

// --- Screens (Props based now, no Context) ---

const WelcomeScreen = ({ onStart, onLogin }: { onStart: () => void, onLogin: () => void }) => (
  <div className="flex flex-col items-center justify-center h-full p-8 bg-slate-900 text-center animate-in fade-in duration-700">
    <style>{`
      @keyframes drive-bounce {
        0%, 100% { transform: translateY(0) rotate(0); }
        25% { transform: translateY(1.5px) rotate(1deg); }
        50% { transform: translateY(0) rotate(0); }
        75% { transform: translateY(-1.5px) rotate(-1deg); }
      }
      @keyframes speed-line {
        0% { transform: translateX(20px); opacity: 0; }
        20% { opacity: 0.5; }
        100% { transform: translateX(-40px); opacity: 0; }
      }
      .car-anim { animation: drive-bounce 0.6s infinite linear; }
      .speed-line-1 { animation: speed-line 1.2s infinite linear; animation-delay: 0s; }
      .speed-line-2 { animation: speed-line 1.2s infinite linear; animation-delay: 0.4s; }
      .speed-line-3 { animation: speed-line 1.2s infinite linear; animation-delay: 0.8s; }
    `}</style>
    
    <div className="relative mb-8">
       <div className="w-28 h-28 bg-yellow-400 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(250,204,21,0.4)] border-4 border-yellow-300 relative overflow-hidden">
          <div className="absolute inset-0 flex flex-col justify-center items-end pr-3 gap-2 opacity-40">
               <div className="w-8 h-1 bg-slate-900 rounded-full speed-line-1"></div>
               <div className="w-5 h-1 bg-slate-900 rounded-full speed-line-2"></div>
               <div className="w-10 h-1 bg-slate-900 rounded-full speed-line-3"></div>
          </div>
          <Car size={56} className="text-slate-900 car-anim relative z-10 ml-1" strokeWidth={2.5} />
       </div>
    </div>

    <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Sou<span className="text-yellow-400">Motorista</span></h1>
    <p className="text-slate-400 mb-12 max-w-xs">Gerencie suas corridas, gastos e lucros com inteligência.</p>
    <div className="w-full max-w-xs">
        <Button onClick={onStart} className="text-lg">
          COMEÇAR <ChevronRight />
        </Button>
        <p className="text-slate-500 text-xs my-4">ou</p>
        <Button onClick={onLogin} variant="secondary">
           Entrar com Google
        </Button>
    </div>
  </div>
);

interface SetupScreenProps {
  user: UserProfile;
  updateUser: (u: Partial<UserProfile>) => void;
  addVehicle: (v: Omit<Vehicle, 'id' | 'trips' | 'maintenance' | 'activeTripId'>) => void;
  isAddingNewVehicle?: boolean;
  onDone: () => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ user, updateUser, addVehicle, isAddingNewVehicle, onDone }) => {
  const [step, setStep] = useState(isAddingNewVehicle ? 2 : (user.firstName ? 2 : 1));
  const [firstName, setFirstName] = useState(user.firstName || '');
  const [lastName, setLastName] = useState(user.lastName || '');
  const [whatsapp, setWhatsapp] = useState(user.whatsapp || '');
  const [wantsDiscounts, setWantsDiscounts] = useState(false);
  
  // Vehicle state
  const [year, setYear] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [versions, setVersions] = useState<string[]>([]);
  const [selectedVersion, setSelectedVersion] = useState('');
  const [customVersion, setCustomVersion] = useState('');

  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const handleUserSubmit = () => {
    if (!firstName || !lastName) return;
    const userId = user.userId || `SM-${Date.now().toString().slice(-7)}`;
    updateUser({ 
        firstName,
        lastName,
        whatsapp,
        userId,
        wantsPartnerDiscounts: wantsDiscounts 
    });
    setStep(2);
  };
  
  useEffect(() => {
     if(user.firstName && !isAddingNewVehicle) {
         setFirstName(user.firstName);
         setLastName(user.lastName);
         setStep(2);
     }
  }, [user, isAddingNewVehicle]);

  useEffect(() => {
    if (selectedBrand && year.length === 4) {
      setModels([]); setSelectedModel(''); setVersions([]); setSelectedVersion(''); setCustomVersion('');
      
      const popularModels = popularVehicleData[selectedBrand as keyof typeof popularVehicleData] || [];
      setModels(popularModels);

      setLoadingModels(true);
      getVehicleModels(selectedBrand, year).then(apiModels => { 
        if (apiModels) {
          const combined = [...popularModels, ...apiModels];
          const uniqueModels = [...new Set(combined)].sort();
          setModels(uniqueModels);
        }
        setLoadingModels(false); 
      });
    }
  }, [selectedBrand, year]);

  useEffect(() => {
    if (selectedModel && selectedBrand && year.length === 4) {
      setVersions([]); setSelectedVersion(''); setCustomVersion('');
      setLoadingVersions(true);
      getVehicleVersions(selectedBrand, selectedModel, year).then(data => { if (data) setVersions(data); setLoadingVersions(false); });
    }
  }, [selectedModel, selectedBrand, year]);


  const handleVehicleSubmit = async () => {
    const finalVersion = selectedVersion === 'custom' ? customVersion : selectedVersion;
    if (!selectedBrand || !selectedModel || !finalVersion || !year) return;
    
    setLoadingSubmit(true);
    
    const fullModelName = `${selectedBrand} ${selectedModel} ${finalVersion}`;
    const specs = await getVehicleSpecs(fullModelName, year);
    
    addVehicle({
      model: `${selectedBrand} ${selectedModel} ${finalVersion}`,
      year,
      plate: '', // Plate can be added later
      avgConsumptionCity: specs?.avgConsumptionCity || 10,
      avgConsumptionHighway: specs?.avgConsumptionHighway || 12,
      fuelTankCapacityLiters: specs?.fuelTankCapacityLiters,
      oilType: specs?.oilType,
    });
    
    if (!isAddingNewVehicle) {
        updateUser({ isSetupComplete: true });
    }
    setLoadingSubmit(false);
    onDone();
  };

  return (
    <div className="p-6 h-full flex flex-col justify-center max-w-md mx-auto">
      {step === 1 ? (
        <div className="space-y-4 animate-in slide-in-from-right">
          <h2 className="text-2xl font-bold text-white">Olá, motorista!</h2>
          <p className="text-slate-400">Vamos configurar seu perfil para começar.</p>
          <Input label="Seu Nome" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Ex: João" />
          <Input label="Sobrenome" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Ex: Silva" />
          <Input label="WhatsApp (Opcional)" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="(11) 99999-9999" type="tel"/>
          
          <div className="flex items-start space-x-3 pt-2">
            <input
              id="wantsDiscounts"
              type="checkbox"
              checked={wantsDiscounts}
              onChange={(e) => setWantsDiscounts(e.target.checked)}
              className="mt-1 h-5 w-5 rounded border-slate-600 bg-slate-700 text-yellow-400 focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-slate-900"
            />
            <label htmlFor="wantsDiscounts" className="text-sm text-slate-300">
              QUERO UTILIZAR MEU CADASTRO PARA RECEBER DESCONTOS EM LOJAS PARCEIRAS DO APLICATIVO #SOUMOTORISTA
            </label>
          </div>
          
          <Button onClick={handleUserSubmit} className="mt-2">Próximo</Button>
        </div>
      ) : (
        <div className="space-y-4 animate-in slide-in-from-right">
          <h2 className="text-2xl font-bold text-white">{isAddingNewVehicle ? "Adicionar Novo Veículo" : "Seu Veículo"}</h2>
          <p className="text-slate-400">Selecione os dados para nossa IA buscar a ficha técnica.</p>
          
          <Input 
            label="Ano" type="number" value={year} onChange={e => setYear(e.target.value)} placeholder="Ex: 2022" maxLength={4} 
          />
          <Select label="Marca" value={selectedBrand} onChange={e => setSelectedBrand(e.target.value)} disabled={year.length !== 4}>
            <option value="" disabled>Selecione a marca</option>
            {allBrands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
          </Select>
          <Select label="Modelo" value={selectedModel} onChange={e => setSelectedModel(e.target.value)} disabled={!selectedBrand || loadingModels} isLoading={loadingModels}>
            <option value="" disabled>Selecione o modelo</option>
            {models.map(model => <option key={model} value={model}>{model}</option>)}
          </Select>
          <Select label="Versão / Motor" value={selectedVersion} onChange={e => setSelectedVersion(e.target.value)} disabled={!selectedModel || loadingVersions} isLoading={loadingVersions}>
            <option value="" disabled>Selecione a versão</option>
            {versions.map(version => <option key={version} value={version}>{version}</option>)}
            {versions.length > 0 && <option disabled>───</option>}
            <option value="custom">Outra / Não encontrei na lista</option>
          </Select>
          
          {selectedVersion === 'custom' && (
             <div className="animate-in fade-in slide-in-from-top-2">
                <Input 
                    label="Digite a Versão Exata" 
                    value={customVersion} 
                    onChange={e => setCustomVersion(e.target.value)} 
                    placeholder="Ex: 1.0 Turbo LTZ" 
                    autoFocus
                />
                <p className="text-xs text-yellow-400 mt-1">A IA buscará a ficha técnica baseada no que você digitar.</p>
             </div>
          )}

          <div className="pt-2">
            <Button onClick={handleVehicleSubmit} isLoading={loadingSubmit} disabled={!selectedVersion || (selectedVersion === 'custom' && !customVersion) || loadingSubmit}>
              {loadingSubmit ? "Buscando dados..." : (isAddingNewVehicle ? "Adicionar Veículo" : "Finalizar Configuração")}
            </Button>
            {isAddingNewVehicle && <Button variant="secondary" onClick={onDone} className="mt-2">Cancelar</Button>}
          </div>
        </div>
      )}
    </div>
  );
};

interface HomeScreenProps {
  state: AppState;
  activeVehicle: Vehicle | null;
  startTrip: (startOdometer: number) => void;
  endTrip: (earnings: number, endOdometer: number) => void;
  navigateTo: (tab: 'home' | 'stations' | 'maint' | 'finance' | 'partners' | 'profile') => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ state, activeVehicle, startTrip, endTrip, navigateTo }) => {
  const [odometer, setOdometer] = useState('');
  const [earnings, setEarnings] = useState('');
  const [showEndModal, setShowEndModal] = useState(false);
  const [showInitialHelp, setShowInitialHelp] = useState(false);
  const [elapsedTime, setElapsedTime] = useState('00h 00m');
  const [simulationAmount, setSimulationAmount] = useState('');
  const [showSimulatorModal, setShowSimulatorModal] = useState(false);

  useEffect(() => {
    const hasSeenHelp = localStorage.getItem('hasSeenHomeHelp');
    if (!hasSeenHelp) {
      setShowInitialHelp(true);
    }
  }, []);

  const activeTrip = activeVehicle?.activeTripId 
    ? activeVehicle.trips.find(t => t.id === activeVehicle.activeTripId) 
    : null;

  useEffect(() => {
    if (!activeTrip) return;
    
    const calculateTime = () => {
      const start = new Date(activeTrip.startTime).getTime();
      const now = new Date().getTime();
      const diff = now - start;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setElapsedTime(`${hours}h ${minutes}m`);
    };

    calculateTime(); // Initial call
    const interval = setInterval(calculateTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [activeTrip]);

  // --- CALIBRATION LOGIC (Moved from FinancialScreen) ---
  const completedShiftsCount = useMemo(() => {
    return activeVehicle?.trips.filter(t => t.status === 'completed').length || 0;
  }, [activeVehicle]);
  const calibrationGoal = 10;
  const calibrationProgress = Math.min((completedShiftsCount / calibrationGoal) * 100, 100);
  const isCalibrated = completedShiftsCount >= calibrationGoal;
  // --- END CALIBRATION LOGIC ---

  const overallMetrics = useMemo(() => {
    if (!activeVehicle) return { earningsPerKm: 0, realAvgConsumption: 10 };
    const allCompletedTrips = activeVehicle.trips.filter(t => t.status === 'completed' && t.distance && t.cost && t.fuelPriceUsed);
    if (allCompletedTrips.length === 0) return { earningsPerKm: 0, realAvgConsumption: activeVehicle.avgConsumptionCity };
    const totalEarnings = allCompletedTrips.reduce((a, t) => a + (t.earnings || 0), 0), totalDistance = allCompletedTrips.reduce((a, t) => a + t.distance!, 0), totalLiters = allCompletedTrips.reduce((a, t) => a + (t.cost! / t.fuelPriceUsed!), 0);
    return { earningsPerKm: totalDistance > 0 ? totalEarnings / totalDistance : 0, realAvgConsumption: totalLiters > 0 ? totalDistance / totalLiters : activeVehicle.avgConsumptionCity };
  }, [activeVehicle]);

  const simulationResults = useMemo(() => {
      const amount = parseFloat(simulationAmount);
      if (isNaN(amount) || amount <= 0) return { distance: 0, earnings: 0, profit: 0 };
      const favoriteStation = state.stations.find(s => s.isFavorite);
      if (!favoriteStation) return { distance: 0, earnings: 0, profit: 0, error: "Defina um posto favorito." };
      if (overallMetrics.earningsPerKm === 0 && !isCalibrated) return { distance: 0, earnings: 0, profit: 0, error: "Complete um turno para calibrar e simular." };
      
      const consumption = isCalibrated ? overallMetrics.realAvgConsumption : activeVehicle?.avgConsumptionCity || 10;
      const earningsKm = isCalibrated ? overallMetrics.earningsPerKm : 2.5; // Default R$2.5/km if not calibrated

      const liters = amount / favoriteStation.price;
      const estimatedDistance = liters * consumption;
      const estimatedEarnings = estimatedDistance * earningsKm;

      return { distance: estimatedDistance, earnings: estimatedEarnings, profit: estimatedEarnings - amount };
  }, [simulationAmount, state.stations, overallMetrics, isCalibrated, activeVehicle]);

  const handleCloseInitialHelp = () => {
    localStorage.setItem('hasSeenHomeHelp', 'true');
    setShowInitialHelp(false);
  };

  if (!activeVehicle) {
    return (
        <div className="p-4 text-center h-full flex flex-col justify-center items-center">
            <Car size={48} className="text-yellow-400 mb-4"/>
            <h3 className="text-xl font-bold text-white">Nenhum veículo selecionado</h3>
            <p className="text-slate-400 mb-6">Vá ao seu perfil para adicionar ou selecionar um veículo.</p>
            <Button onClick={() => navigateTo('profile')} className="max-w-xs">Ir para o Perfil</Button>
        </div>
    );
  }

  const favoriteStation = state.stations.find(s => s.isFavorite);

  const handleStart = () => {
    if (!odometer) return alert("Informe o KM do painel (Trip)");
    startTrip(parseFloat(odometer));
    setOdometer('');
  };

  const handleEnd = () => {
    if (!earnings || !odometer) return alert("Preencha todos os campos");
    endTrip(parseFloat(earnings), parseFloat(odometer));
    setShowEndModal(false);
    setOdometer('');
    setEarnings('');
  };

  return (
    <div className="p-4 space-y-6 pb-24">
       {showInitialHelp && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in">
          <div 
            className="bg-slate-800 border border-slate-700 p-6 rounded-2xl w-full max-w-sm space-y-4 shadow-2xl text-center"
          >
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                <Sparkles size={32} className="text-slate-900" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white">Bem-vindo(a)!</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Sempre que tiver dúvidas, procure por este ícone de ajuda no canto da tela para uma explicação rápida.
            </p>
            <div className="flex justify-center my-4">
              <div className="p-3 bg-slate-700 rounded-full">
                <HelpCircle size={28} className="text-yellow-400" />
              </div>
            </div>
            <Button onClick={handleCloseInitialHelp} className="mt-2">
              Entendi, vamos começar!
            </Button>
          </div>
        </div>
      )}

      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Olá, {state.user.firstName}</h2>
          <p className="text-slate-400 text-sm">{activeTrip ? 'Dia de trabalho iniciado!' : 'Pronto para o expediente?'}</p>
        </div>
        <div className="flex items-center gap-2">
           <div className="bg-slate-800 p-2 rounded-lg border border-slate-700 text-center">
             <p className="text-xs text-slate-400">{activeVehicle.model}</p>
             <p className="text-xs font-mono text-yellow-400">{activeVehicle.year}</p>
          </div>
          <HelpTooltip 
            title="Como funciona o Turno Diário" 
            content={
              <>
                <p>O app foi feito para calcular o <strong>dia inteiro de trabalho</strong>, não corridas individuais.</p>
                <ol className="list-decimal pl-4 space-y-2 mt-2">
                  <li><strong>Ao sair de casa:</strong> Zere o TRIP do carro, digite 0 no app e inicie o turno.</li>
                  <li><strong>Durante o dia:</strong> Trabalhe normalmente em todos os apps (Uber, 99, etc).</li>
                  <li><strong>Ao parar (fim do dia):</strong> Clique em FINALIZAR. Digite o KM total que você rodou e a SOMA de tudo que ganhou nos aplicativos.</li>
                </ol>
                <p className="mt-2 text-xs text-slate-400">Assim calculamos seu lucro real diário descontando o combustível.</p>
              </>
            } 
          />
        </div>
      </header>

      {/* --- CALIBRATION WIDGET (Moved from Financial) --- */}
      <div className={`p-4 rounded-xl border transition-all ${isCalibrated ? 'bg-green-900/20 border-green-500/30' : 'bg-slate-800 border-slate-700'}`}>
        <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-slate-200 flex items-center gap-2 text-sm">
                <Activity size={16} className={isCalibrated ? "text-green-400" : "text-yellow-400"} />
                {isCalibrated ? "Dados Calibrados" : "Calibrando Estatísticas"}
            </h3>
            <span className="text-xs font-mono text-slate-400">{completedShiftsCount}/{calibrationGoal} Turnos</span>
        </div>
        {!isCalibrated && (
            <div className="w-full bg-slate-900 rounded-full h-2 mb-2 border border-slate-800">
                <div className="bg-yellow-400 h-2 rounded-full transition-all duration-700" style={{width: `${calibrationProgress}%`}}></div>
            </div>
        )}
        <p className="text-xs text-slate-400 flex items-start gap-1">
            <Sparkles size={12} className="mt-0.5 text-yellow-400 flex-shrink-0"/>
            {isCalibrated
                ? "Ótimo! Você tem dados suficientes para uma média confiável."
                : "Continue registrando turnos completos. Quanto mais dados, mais exata será a previsão de lucro real."}
        </p>
     </div>
     {/* --- END CALIBRATION WIDGET --- */}

      {/* Main Action Card */}
      <div className={`rounded-2xl p-6 shadow-xl transition-all ${activeTrip ? 'bg-gradient-to-br from-green-600 to-emerald-800' : 'bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700'}`}>
        
        {activeTrip ? (
          <div className="space-y-4">
            <div className="flex justify-between items-start mb-2">
               <div className="flex items-center gap-3">
                 <div className="animate-pulse w-3 h-3 bg-white rounded-full"></div>
                 <span className="font-bold text-white tracking-wider">EM TURNO</span>
               </div>
               <div className="bg-black/20 px-3 py-1 rounded-lg">
                 <p className="text-green-100 text-xs font-mono">{elapsedTime}</p>
               </div>
            </div>
            <div className="bg-black/20 p-4 rounded-xl flex justify-between items-center">
              <div>
                 <p className="text-green-100 text-sm">KM Inicial</p>
                 <p className="text-2xl font-mono text-white">{activeTrip.startOdometer} km</p>
              </div>
              <Clock className="text-green-200/50" size={32} />
            </div>
            <Button onClick={() => setShowEndModal(true)} className="bg-white text-green-900 hover:bg-green-50">
              <Square fill="currentColor" size={18} /> FINALIZAR DIA
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
             <div className="flex items-center justify-between">
               <span className="font-bold text-slate-200">INICIAR TURNO</span>
             </div>
             <div className="bg-slate-950/30 rounded-xl border border-white/5">
                {favoriteStation ? (
                  <div className="p-3 flex justify-between items-center">
                    <span className="text-xs text-slate-400">Posto Favorito (Base)</span>
                    <span className="text-sm font-bold text-yellow-400">{favoriteStation.name} - R$ {favoriteStation.price.toFixed(2)}</span>
                  </div>
                ) : (
                  <button onClick={() => navigateTo('stations')} className="w-full p-3 flex items-center justify-center gap-2 text-red-400 text-sm hover:bg-red-400/10 transition-colors rounded-xl">
                    <AlertTriangle size={14} /> Adicione um posto favorito primeiro!
                  </button>
                )}
             </div>
             <Input label="KM do Painel (Ao Sair)" type="number" placeholder="0.0" value={odometer} onChange={(e) => setOdometer(e.target.value)} className="font-mono text-lg" />
             <Button onClick={handleStart} disabled={!favoriteStation}>
               <Play fill="currentColor" size={18} /> INICIAR AGORA
             </Button>
          </div>
        )}
      </div>

      {showEndModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-sm space-y-4 animate-in zoom-in-95">
            <h3 className="text-xl font-bold text-white">Fim de Expediente</h3>
            <p className="text-sm text-slate-400">Insira os dados finais para calcular seu lucro do dia.</p>
            <Input label="KM do Painel (Ao Parar)" type="number" value={odometer} onChange={e => setOdometer(e.target.value)} autoFocus placeholder="Ex: 5430"/>
            <Input label="Soma de Ganhos (Uber+99+Etc)" type="number" value={earnings} onChange={e => setEarnings(e.target.value)} placeholder="Ex: 350.00" />
            <div className="flex gap-3 pt-2">
              <Button variant="secondary" onClick={() => setShowEndModal(false)}>Cancelar</Button>
              <Button onClick={handleEnd}>Confirmar e Salvar</Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="font-bold text-slate-300">Ferramenta Rápida</h3>
        <Button variant="secondary" onClick={() => setShowSimulatorModal(true)} className="w-full">
          <Rocket size={16} /> Simulador de Ganhos
        </Button>
      </div>

      {showSimulatorModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-sm space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2"><Rocket size={18} className="text-yellow-400" /> Simulador de Ganhos</h3>
              <button onClick={() => setShowSimulatorModal(false)}><X className="text-slate-400"/></button>
            </div>
            <div className="text-sm text-slate-400 space-y-2 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                <p>
                    🤔 <strong className="text-slate-300">Função:</strong> Prever quanto você pode lucrar com um valor específico de combustível.
                </p>
                <p>
                    📈 <strong className="text-slate-300">Como funciona:</strong> {isCalibrated ? 'Usa sua média real de ganhos e consumo (aprendida com seus turnos) para fazer uma estimativa inteligente.' : 'Usa dados de fábrica do seu carro e uma média de ganhos. Complete 10 turnos para calibrar e obter previsões mais precisas!'}
                </p>
            </div>
            <Input label="Se eu abastecer (R$)" type="number" value={simulationAmount} onChange={e => setSimulationAmount(e.target.value)} placeholder="Ex: 50.00" autoFocus/>
            {simulationAmount && (
              <div className="bg-slate-800 p-3 rounded-lg space-y-2 border border-slate-700">
                  {simulationResults.error ? <p className="text-red-400 text-sm text-center">{simulationResults.error}</p> : (
                      <>
                          <div className="flex justify-between text-sm"><span className="text-slate-400">Distância Estimada</span><span className="font-bold text-white">{simulationResults.distance.toFixed(1)} km</span></div>
                          <div className="flex justify-between text-sm"><span className="text-slate-400">Ganho Bruto Estimado</span><span className="font-bold text-green-400">R$ {simulationResults.earnings.toFixed(2)}</span></div>
                          <div className="flex justify-between text-sm border-t border-slate-700 mt-2 pt-2"><span className="text-slate-300">Lucro Líquido Estimado</span><span className="font-bold text-yellow-400">R$ {simulationResults.profit.toFixed(2)}</span></div>
                      </>
                  )}
              </div>
            )}
            <Button variant="secondary" onClick={() => setShowSimulatorModal(false)}>Fechar</Button>
          </div>
        </div>
      )}
    </div>
  );
};

interface StationsScreenProps {
  state: AppState;
  addStation: (s: GasStation) => void;
  toggleFavoriteStation: (id: string) => void;
  deleteStation: (id: string) => void;
}

const StationsScreen: React.FC<StationsScreenProps> = ({ state, addStation, toggleFavoriteStation, deleteStation }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newStation, setNewStation] = useState({ name: '', price: '', fuelType: FuelType.GASOLINE, address: '' });
  const [coordinates, setCoordinates] = useState<{lat: number, lon: number} | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [extractedFuels, setExtractedFuels] = useState<ExtractedFuelPrice[]>([]);
  const [analysisMessage, setAnalysisMessage] = useState<{type: 'error' | 'success', text: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = (reader.result as string).split(',')[1];
            resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsAnalyzingPhoto(true); setExtractedFuels([]); setAnalysisMessage(null);
    try {
        const base64Image = await blobToBase64(file);
        const results = await extractFuelPricesFromImage(base64Image, file.type);
        if (results && results.length > 0) {
           setExtractedFuels(results);
           setAnalysisMessage({type: 'success', text: `Encontramos ${results.length} preços!`});
        } else {
           setAnalysisMessage({type: 'error', text: "Não encontramos preços nítidos na imagem. Tente aproximar a placa."});
        }
    } catch (error) {
        console.error("Image analysis failed", error);
        setAnalysisMessage({type: 'error', text: "Erro ao analisar. Verifique sua conexão."});
    } finally {
        setIsAnalyzingPhoto(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSelectExtractedFuel = (fuel: ExtractedFuelPrice) => {
    setNewStation(prev => ({ ...prev, price: fuel.price.toString(), fuelType: fuel.fuelType }));
    // Just visually acknowledge (no alerting needed, form updates)
  };
  
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocalização não é suportada pelo seu navegador.");
      return;
    }
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ lat: latitude, lon: longitude });
        
        const address = await getAddressFromCoordinates(latitude, longitude);
        
        if (address) {
          setNewStation(prev => ({ ...prev, address: address }));
        } else {
          setNewStation(prev => ({ ...prev, address: "Localização capturada!" }));
        }
        
        setIsGettingLocation(false);
      },
      () => { 
        alert("Não foi possível obter a localização. Verifique as permissões."); 
        setIsGettingLocation(false); 
      }
    );
  };

  const handleAdd = () => {
    if (!newStation.name || !newStation.price) return;
    const stationToAdd: GasStation = {
      id: Date.now().toString(), name: newStation.name, price: parseFloat(newStation.price), fuelType: newStation.fuelType, isFavorite: state.stations.length === 0, dateUpdated: new Date().toISOString()
    };
    if(newStation.address && newStation.address !== "Localização atual capturada!") stationToAdd.address = newStation.address;
    if(coordinates){ stationToAdd.latitude = coordinates.lat; stationToAdd.longitude = coordinates.lon; }
    addStation(stationToAdd);
    setNewStation({ name: '', price: '', fuelType: FuelType.GASOLINE, address: '' });
    setCoordinates(null); setIsAdding(false); setExtractedFuels([]); setAnalysisMessage(null);
  };
  
  const handleCancel = () => {
    setIsAdding(false);
    setNewStation({ name: '', price: '', fuelType: FuelType.GASOLINE, address: '' });
    setCoordinates(null);
    setExtractedFuels([]);
    setAnalysisMessage(null);
  };

  const openInMaps = (station: GasStation) => {
    const query = station.latitude && station.longitude ? `${station.latitude},${station.longitude}` : encodeURIComponent(station.address!);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <div className="p-4 space-y-6 pb-24 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white">Postos</h2>
            <HelpTooltip title="Gerenciando Postos" content={<><p>Cadastre os postos onde você abastece para ter um histórico de preços.</p><p className="mt-2 text-yellow-400 font-bold">Dica Crucial:</p><p>Marque a <strong>Estrela (Favorito)</strong> no posto que você usa no dia a dia. O preço desse posto será usado para calcular o custo de combustível de TODOS os seus turnos.</p></>}/>
        </div>
        
        <button onClick={() => setIsAdding(!isAdding)} className="p-2 bg-yellow-400 text-slate-900 rounded-lg">{isAdding ? <ChevronDown /> : <Plus />}</button>
      </div>

      {isAdding && (
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-4 animate-in slide-in-from-top-4">
          <input type="file" accept="image/*" capture="environment" onChange={handleImageUpload} className="hidden" ref={fileInputRef} />
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()} isLoading={isAnalyzingPhoto}>
            <Camera size={16} /> {isAnalyzingPhoto ? 'Analisando...' : 'Adicionar com Foto'} <Sparkles size={16} className="text-yellow-400"/>
          </Button>

          {/* Loader Visual */}
          {isAnalyzingPhoto && (
            <div className="py-6 text-center bg-slate-900/50 rounded-xl border border-dashed border-slate-600 animate-pulse flex flex-col items-center justify-center gap-2">
                 <div className="relative">
                    <div className="absolute inset-0 bg-yellow-400 blur-lg opacity-20 animate-pulse"></div>
                    <ScanLine size={32} className="text-yellow-400 animate-spin-slow relative z-10" />
                 </div>
                 <p className="text-slate-300 font-medium text-sm">A IA está lendo a placa de preços...</p>
            </div>
          )}

          {/* Mensagens de Erro/Sucesso Inline */}
          {analysisMessage && !isAnalyzingPhoto && (
             <div className={`p-3 rounded-lg text-sm text-center ${analysisMessage.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                {analysisMessage.text}
             </div>
          )}

          {/* Resultados Interativos */}
          {!isAnalyzingPhoto && extractedFuels.length > 0 && (
            <div className="bg-slate-900/50 p-3 rounded-xl border border-green-500/30 space-y-2 animate-in slide-in-from-top-2">
                <div className="flex items-center gap-2 mb-1">
                    <CheckCircle size={14} className="text-green-400" />
                    <p className="text-xs font-bold text-green-100 uppercase">Preços Detectados</p>
                </div>
                <p className="text-xs text-slate-400">Toque em um item para preencher o formulário:</p>
                <div className="grid grid-cols-2 gap-2">
                    {extractedFuels.map((fuel, idx) => (
                        <button
                             key={`${fuel.fuelType}-${idx}`} 
                             onClick={() => handleSelectExtractedFuel(fuel)} 
                             className="bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-yellow-400 p-3 rounded-lg text-left transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-400 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <p className="text-xs text-slate-400 group-hover:text-white font-bold uppercase">{fuel.fuelType}</p>
                            <p className="text-lg font-bold text-green-400">R$ {fuel.price.toFixed(2)}</p>
                        </button>
                    ))}
                </div>
            </div>
          )}

          <Input label="Nome do Posto" value={newStation.name} onChange={e => setNewStation({...newStation, name: e.target.value})} />
          <Input label="Preço (R$)" type="number" step="0.01" value={newStation.price} onChange={e => setNewStation({...newStation, price: e.target.value})} />
          <div className="relative">
            <Input label="Endereço (Opcional)" value={newStation.address} onChange={e => setNewStation({...newStation, address: e.target.value})} placeholder="Rua Exemplo, 123 ou use GPS"/>
            <button onClick={handleGetLocation} disabled={isGettingLocation} className="absolute right-2 bottom-2 p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-yellow-400 disabled:opacity-50" aria-label="Usar localização atual">
                {isGettingLocation ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <MapPin size={16} />}
            </button>
          </div>
          <div className="flex flex-col gap-1">
             <label className="text-sm text-slate-400 font-medium ml-1">Combustível</label>
             <select className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400" value={newStation.fuelType} onChange={(e) => setNewStation({...newStation, fuelType: e.target.value as FuelType})}>
               {Object.values(FuelType).map(t => <option key={t} value={t}>{t}</option>)}
             </select>
          </div>
           <div className="flex gap-3 pt-2">
              <Button variant="secondary" onClick={handleCancel}>Cancelar</Button>
              <Button onClick={handleAdd}>Salvar Posto</Button>
            </div>
        </div>
      )}

      <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar">
        {state.stations.length === 0 ? <div className="text-center text-slate-500 mt-10">Nenhum posto cadastrado.</div> : state.stations.map(station => (
            <div key={station.id} className={`p-4 rounded-xl border flex justify-between items-center ${station.isFavorite ? 'bg-yellow-400/10 border-yellow-400/50' : 'bg-slate-800 border-slate-700'}`}>
              <div>
                <div className="flex items-center gap-2"><h3 className="font-bold text-white">{station.name}</h3>{station.isFavorite && <span className="text-[10px] bg-yellow-400 text-slate-900 px-1.5 py-0.5 rounded font-bold">FAVORITO</span>}</div>
                <p className="text-slate-400 text-sm">{station.fuelType} • <span className="text-green-400 font-mono font-bold">R$ {station.price.toFixed(2)}</span></p>
                {station.address && <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><MapPin size={12}/> {station.address}</p>}
              </div>
              <div className="flex gap-1">
                 {(station.latitude || station.address) && <button onClick={() => openInMaps(station)} className="p-2 text-blue-400 hover:text-blue-300"><MapPin size={20} /></button>}
                 <button onClick={() => toggleFavoriteStation(station.id)} className={`p-2 rounded-lg ${station.isFavorite ? 'text-yellow-400 hover:text-yellow-300' : 'text-slate-500 hover:text-slate-300'}`}><Star fill={station.isFavorite ? "currentColor" : "none"} size={20} /></button>
                 <button onClick={() => deleteStation(station.id)} className="p-2 text-red-400 hover:text-red-300"><Trash2 size={20} /></button>
              </div>
            </div>
        ))}
      </div>
    </div>
  );
};

interface MaintenanceScreenProps {
  state: AppState;
  activeVehicle: Vehicle | null;
  addMaintenance: (m: MaintenanceItem) => void;
}

const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({ activeVehicle, addMaintenance }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newMaint, setNewMaint] = useState({ name: '', cost: '', serviceDate: '', serviceOdometer: '', intervalKm: '', intervalMonths: '' });
  const [schedules, setSchedules] = useState<MaintenanceScheduleItem[] | null>(null);
  const [loadingSchedules, setLoadingSchedules] = useState(true);

  useEffect(() => {
    if (isAdding && activeVehicle) {
      setLoadingSchedules(true);
      getMaintenanceSchedule(activeVehicle.model, activeVehicle.year)
        .then(data => { if (data) setSchedules(data); setLoadingSchedules(false); });
    }
  }, [isAdding, activeVehicle]);
  
  const handleAdd = () => {
    if (!newMaint.name || !newMaint.cost || !newMaint.serviceDate || !newMaint.serviceOdometer) return alert("Preencha o nome, custo, data e KM do serviço.");
    const serviceDateObj = new Date(newMaint.serviceDate + 'T00:00:00');
    addMaintenance({
      id: Date.now().toString(), name: newMaint.name, cost: parseFloat(newMaint.cost), date: serviceDateObj.toISOString(),
      lastServiceOdometer: parseInt(newMaint.serviceOdometer), 
      nextRevisionDate: newMaint.intervalMonths ? new Date(new Date(serviceDateObj).setMonth(serviceDateObj.getMonth() + parseInt(newMaint.intervalMonths))).toISOString() : undefined,
      nextRevisionKm: newMaint.intervalKm ? parseInt(newMaint.serviceOdometer) + parseInt(newMaint.intervalKm) : undefined,
      intervalKm: newMaint.intervalKm ? parseInt(newMaint.intervalKm) : undefined,
      intervalMonths: newMaint.intervalMonths ? parseInt(newMaint.intervalMonths) : undefined,
      completed: true
    });
    setNewMaint({ name: '', cost: '', serviceDate: '', serviceOdometer: '', intervalKm: '', intervalMonths: '' }); setIsAdding(false);
  };
  
  const handleSelectSchedule = (schedule: MaintenanceScheduleItem) => setNewMaint(prev => ({...prev, name: schedule.name, intervalKm: schedule.intervalKm.toString(), intervalMonths: schedule.intervalMonths.toString()}));
  
  const getDaysRemainingInfo = (dateString: string): { days: number; text: string } | null => {
    const now = new Date(); now.setHours(0, 0, 0, 0); const revisionDate = new Date(dateString); revisionDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((revisionDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return null;
    return { days: diffDays, text: diffDays === 0 ? 'Hoje' : (diffDays === 1 ? 'Amanhã' : `Em ${diffDays} dias`) };
  };

  const upcomingRevisions = useMemo(() => activeVehicle?.maintenance
    .map(m => {
      if (!m.nextRevisionDate) return null;
      const remaining = getDaysRemainingInfo(m.nextRevisionDate);
      return (remaining !== null && remaining.days <= 30) ? { ...m, remaining } : null;
    })
    .filter((m): m is MaintenanceItem & { remaining: { days: number; text: string } } => m !== null)
    .sort((a, b) => a.remaining.days - b.remaining.days) || [], [activeVehicle]);

  return (
    <div className="p-4 space-y-6 pb-24 h-full overflow-y-auto no-scrollbar">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white">Manutenção</h2>
            <HelpTooltip title="Controle de Manutenção" content={<><p>Registre trocas de óleo, pneus e revisões.</p><p>Ao informar o <strong>Intervalo (KM ou Meses)</strong> no cadastro, o app calcula automaticamente e te avisa quando a próxima revisão estiver chegando, baseada na sua rodagem diária.</p></>}/>
        </div>
        <button onClick={() => setIsAdding(!isAdding)} className="p-2 bg-yellow-400 text-slate-900 rounded-lg" disabled={!activeVehicle}>{isAdding ? <ChevronDown /> : <Plus />}</button>
      </div>
      
      {!activeVehicle && <p className="text-center text-slate-500 mt-10">Selecione um veículo no seu perfil para gerenciar a manutenção.</p>}

      {isAdding && activeVehicle && (
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 space-y-4 animate-in slide-in-from-top-4">
          <h3 className="font-bold text-slate-300">Registrar Manutenção ({activeVehicle.model})</h3>
          {loadingSchedules ? <p className="text-center text-slate-400 text-sm py-2 animate-pulse">Buscando sugestões da IA...</p> : (schedules && schedules.length > 0 && (
            <div className="space-y-2">
                <p className="text-xs text-slate-400 flex items-center gap-1.5 justify-center"><Rocket size={12} className="text-yellow-400"/> Sugestões da IA (Toque para usar)</p>
                <div className="flex flex-wrap gap-2 justify-center">{schedules.map(s => <button key={s.name} onClick={() => handleSelectSchedule(s)} className="bg-slate-700 text-xs px-3 py-1.5 rounded-full hover:bg-slate-600 transition-colors">{s.name}</button>)}</div>
            </div>
          ))}
          <Input label="Peça / Serviço" placeholder="Ex: Troca de Óleo" value={newMaint.name} onChange={e => setNewMaint({...newMaint, name: e.target.value})} />
          <div className="grid grid-cols-2 gap-3"><Input label="Custo (R$)" type="number" placeholder="0.00" value={newMaint.cost} onChange={e => setNewMaint({...newMaint, cost: e.target.value})} /><Input label="Data do Serviço" type="date" value={newMaint.serviceDate} onChange={e => setNewMaint({...newMaint, serviceDate: e.target.value})} /></div>
          <Input label="KM do Veículo no Serviço" type="number" placeholder="Ex: 50000" value={newMaint.serviceOdometer} onChange={e => setNewMaint({...newMaint, serviceOdometer: e.target.value})} />
          <p className="text-xs text-slate-400 pt-2 border-t border-slate-700">Opcional: Calcular Próxima Revisão</p>
          <div className="grid grid-cols-2 gap-3"><Input label="Intervalo (KM)" type="number" placeholder="Ex: 10000" value={newMaint.intervalKm} onChange={e => setNewMaint({...newMaint, intervalKm: e.target.value})} /><Input label="Intervalo (Meses)" type="number" placeholder="Ex: 6" value={newMaint.intervalMonths} onChange={e => setNewMaint({...newMaint, intervalMonths: e.target.value})} /></div>
          <Button onClick={handleAdd} variant="secondary">Registrar</Button>
        </div>
      )}

      {upcomingRevisions.length > 0 && (
        <div className="bg-yellow-400/10 p-4 rounded-xl border border-yellow-400/30 space-y-3 animate-in fade-in">
          <div className="flex items-center gap-2"><AlertTriangle className="text-yellow-400" /><h3 className="font-bold text-yellow-300">Revisões Próximas</h3></div>
          <ul className="space-y-2">{upcomingRevisions.map(m => <li key={m.id} className="flex justify-between items-center text-sm bg-slate-900/30 p-2 rounded-md"><span className="text-slate-200 font-medium">{m.name}</span><span className={`font-bold text-sm ${m.remaining.days <= 5 ? 'text-red-400' : 'text-yellow-400'}`}>{m.remaining.text}</span></li>)}</ul>
        </div>
      )}
      
      {activeVehicle && <div className="space-y-3">
        <h3 className="font-bold text-slate-300">Histórico & Futuro</h3>
        {activeVehicle.maintenance.length === 0 ? <div className="text-center text-slate-500 mt-10">Nenhum registro de manutenção.</div> : activeVehicle.maintenance.slice().reverse().map(m => (
            <div key={m.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between items-start">
              <div>
                <p className="font-bold text-white">{m.name}</p>
                <p className="text-xs text-slate-500">{new Date(m.date).toLocaleDateString('pt-BR')} {m.lastServiceOdometer ? `• ${m.lastServiceOdometer.toLocaleString('pt-BR')} km` : ''}</p>
                {(m.nextRevisionDate || m.nextRevisionKm) && (<div className="mt-2 bg-slate-800 p-2 rounded-md text-xs space-y-1 w-fit"><p className="font-bold text-yellow-400">Próxima Revisão:</p>{m.nextRevisionDate && <p className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(m.nextRevisionDate).toLocaleDateString('pt-BR')}</p>}{m.nextRevisionKm && <p className="flex items-center gap-1.5"><Car size={12} /> {m.nextRevisionKm.toLocaleString('pt-BR')} km</p>}</div>)}
              </div>
              <p className="font-mono font-bold text-red-400 text-lg whitespace-nowrap">- R$ {m.cost.toFixed(2)}</p>
            </div>
        ))}
      </div>}
    </div>
  );
};

interface FinancialScreenProps {
  state: AppState;
  activeVehicle: Vehicle | null;
  addExpense: (e: Omit<Expense, 'id' | 'vehicleId'>) => void;
  deleteExpense: (id: string) => void;
  setGoal: (g: Omit<Goal, 'id' | 'vehicleId' | 'startDate'>) => void;
  viewTripDetails: (trip: Trip) => void;
}

const FinancialScreen: React.FC<FinancialScreenProps> = ({ state, activeVehicle, addExpense, deleteExpense, setGoal, viewTripDetails }) => {
  const [financeView, setFinanceView] = useState<'dashboard' | 'expenses'>('dashboard');
  const [filter, setFilter] = useState<'today' | 'week' | 'month' | '3months' | '6months' | 'year' | 'custom'>('week');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [advice, setAdvice] = useState<string>('');
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [paidMonths, setPaidMonths] = useState<Record<string, boolean>>(() => {
     try {
       return JSON.parse(localStorage.getItem('meiPaidMonths') || '{}');
     } catch { return {} }
  });

  // Modals state
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showFiscalModal, setShowFiscalModal] = useState(false);

  // New Expense state
  const [newExpense, setNewExpense] = useState({ name: '', cost: '', date: '', category: ExpenseCategory.OUTROS });
  
  // New Goal state
  const [newGoal, setNewGoal] = useState({ type: 'weekly' as 'weekly' | 'monthly', target: '' });

  useEffect(() => {
    localStorage.setItem('meiPaidMonths', JSON.stringify(paidMonths));
  }, [paidMonths]);

  const activeGoal = useMemo(() => {
    if (!activeVehicle) return null;
    return state.goals.find(g => g.vehicleId === activeVehicle.id);
  }, [state.goals, activeVehicle]);


  const filteredData = useMemo(() => {
    const now = new Date();
    const getFilterRange = () => {
        let start = new Date(), end = new Date();
        switch (filter) {
            case 'today': start = new Date(now.setHours(0,0,0,0)); end = new Date(new Date().setHours(23,59,59,999)); break;
            case 'week': start = new Date(new Date().setDate(now.getDate() - 6)); start.setHours(0,0,0,0); break;
            case 'month': start = new Date(now.getFullYear(), now.getMonth(), 1); break;
            case '3months': start = new Date(now.getFullYear(), now.getMonth() - 2, 1); break;
            case '6months': start = new Date(now.getFullYear(), now.getMonth() - 5, 1); break;
            case 'year': start = new Date(now.getFullYear(), 0, 1); break;
            case 'custom':
                if (!customStartDate || !customEndDate) return { start: null, end: null };
                start = new Date(customStartDate + 'T00:00:00');
                end = new Date(customEndDate + 'T23:59:59');
                break;
        }
        return { start, end };
    };

    const { start, end } = getFilterRange();
    if (!start || !end) return { trips: [], expenses: [], start: new Date(), end: new Date() };
    
    const trips = activeVehicle?.trips.filter(t => t.status === 'completed' && t.endTime && new Date(t.endTime) >= start && new Date(t.endTime) <= end) || [];
    const expenses = state.expenses.filter(e => e.vehicleId === activeVehicle?.id && new Date(e.date) >= start && new Date(e.date) <= end) || [];

    return { trips, expenses, start, end };
  }, [filter, activeVehicle, state.expenses, customStartDate, customEndDate]);


  const metrics = useMemo(() => {
    const { trips, expenses } = filteredData;
    const totalEarnings = trips.reduce((a, t) => a + (t.earnings || 0), 0);
    const totalFuelCost = trips.reduce((a, t) => a + (t.cost || 0), 0);
    const totalOtherExpenses = expenses.reduce((a, e) => a + e.cost, 0);
    const totalCost = totalFuelCost + totalOtherExpenses;
    const totalDistance = trips.reduce((a, t) => a + (t.distance || 0), 0);
    const totalDurationMs = trips.reduce((a, t) => a + (new Date(t.endTime!).getTime() - new Date(t.startTime).getTime()), 0);
    const netProfit = totalEarnings - totalCost;
    const uniqueDays = new Set(trips.map(t => new Date(t.endTime!).toDateString())).size;
    return {
        totalEarnings, netProfit, totalCost, totalOtherExpenses,
        profitPerKm: totalDistance > 0 ? netProfit / totalDistance : 0, costPerKm: totalDistance > 0 ? totalCost / totalDistance : 0,
        earningsPerHour: (totalDurationMs / 3600000) > 0 ? totalEarnings / (totalDurationMs / 3600000) : 0,
        avgDailyProfit: uniqueDays > 0 ? netProfit / uniqueDays : 0,
    };
  }, [filteredData]);

  // Fiscal calculations
  const totalYearEarnings = useMemo(() => {
      const currentYear = new Date().getFullYear();
      const tripsThisYear = activeVehicle?.trips.filter(t => t.status === 'completed' && t.endTime && new Date(t.endTime).getFullYear() === currentYear) || [];
      return tripsThisYear.reduce((acc, t) => acc + (t.earnings || 0), 0);
  }, [activeVehicle]);
  const meiLimit = 81000;
  const meiProgress = Math.min((totalYearEarnings / meiLimit) * 100, 100);

  const handleFetchAdvice = async () => {
    setLoadingAdvice(true); setAdvice('');
    if (filteredData.trips.length > 0) {
      const newAdvice = await getFinancialAdvice(`Ganho Bruto: R$${metrics.totalEarnings.toFixed(2)}; Lucro Líquido: R$${metrics.netProfit.toFixed(2)}; Total de Turnos: ${filteredData.trips.length}`);
      setAdvice(newAdvice);
    }
    setLoadingAdvice(false);
  };
  
  const handleAddExpense = () => {
    if(!newExpense.name || !newExpense.cost || !newExpense.date) return alert("Preencha todos os campos da despesa.");
    addExpense({ ...newExpense, cost: parseFloat(newExpense.cost), date: new Date(newExpense.date + 'T00:00:00').toISOString() });
    setNewExpense({ name: '', cost: '', date: '', category: ExpenseCategory.OUTROS });
    setShowExpenseModal(false);
  };

  const handleSetGoal = () => {
    if(!newGoal.target) return;
    setGoal({ type: newGoal.type, target: parseFloat(newGoal.target) });
    setShowGoalModal(false);
  };
  
  const goalProgress = useMemo(() => {
    if (!activeGoal) return { current: 0, target: 0, percentage: 0 };
    
    const now = new Date();
    let start, end = new Date();
    if (activeGoal.type === 'weekly') {
        const firstDay = now.getDate() - now.getDay();
        start = new Date(now.setDate(firstDay));
        start.setHours(0,0,0,0);
    } else { // monthly
        start = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    const trips = activeVehicle?.trips.filter(t => t.status === 'completed' && t.endTime && new Date(t.endTime) >= start && new Date(t.endTime) <= end) || [];
    const expenses = state.expenses.filter(e => e.vehicleId === activeVehicle?.id && new Date(e.date) >= start && new Date(e.date) <= end) || [];
    const profit = trips.reduce((a, t) => a + (t.profit || 0), 0) - expenses.reduce((a,e) => a + e.cost, 0);

    return { current: profit, target: activeGoal.target, percentage: Math.min((profit / activeGoal.target) * 100, 100) };
  }, [activeGoal, activeVehicle, state.expenses]);


  useEffect(() => { handleFetchAdvice(); }, [filter, activeVehicle, customStartDate, customEndDate]);

  const KPI_Card = ({ title, value, icon, colorClass = 'text-white' }: {title: string, value: string, icon: React.ReactNode, colorClass?: string}) => (<div className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex items-start gap-3"><div className="p-2 bg-slate-900 rounded-lg">{icon}</div><div><p className="text-slate-400 text-xs">{title}</p><p className={`text-lg font-bold ${colorClass}`}>{value}</p></div></div>);
  
  const DashboardView = () => (
    <>
     <div className="grid grid-cols-2 gap-3">
         <Button onClick={() => setShowReportModal(true)} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 !shadow-none !text-white flex flex-col items-center h-auto py-4">
             <FileText className="text-blue-400 mb-1" size={24}/>
             <span className="text-sm">Relatório Completo</span>
         </Button>
         <Button onClick={() => setShowFiscalModal(true)} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 !shadow-none !text-white flex flex-col items-center h-auto py-4">
             <Building2 className="text-green-400 mb-1" size={24}/>
             <span className="text-sm">Assistente Fiscal</span>
         </Button>
     </div>

      <div className="grid grid-cols-2 gap-3">
          <KPI_Card title="Lucro Líquido" value={`R$ ${metrics.netProfit.toFixed(2)}`} icon={<DollarSign size={20} className="text-green-400"/>} colorClass="text-green-400"/>
          <KPI_Card title="Ganho Bruto" value={`R$ ${metrics.totalEarnings.toFixed(2)}`} icon={<Briefcase size={20} className="text-blue-400"/>} colorClass="text-blue-400"/>
          <KPI_Card title="Despesas Totais" value={`R$ ${metrics.totalCost.toFixed(2)}`} icon={<TrendingDown size={20} className="text-red-400"/>} colorClass="text-red-400"/>
          <KPI_Card title="Ganho / Hora" value={`R$ ${metrics.earningsPerHour.toFixed(2)}`} icon={<Clock size={20} className="text-yellow-400"/>} colorClass="text-yellow-400"/>
          <KPI_Card title="Lucro / Dia" value={`R$ ${metrics.avgDailyProfit.toFixed(2)}`} icon={<Calendar size={20} className="text-purple-400"/>} colorClass="text-purple-400"/>
          <KPI_Card title="Lucro / KM" value={`R$ ${metrics.profitPerKm.toFixed(2)}`} icon={<TrendingUp size={20} className="text-teal-400"/>} colorClass="text-teal-400"/>
      </div>
     
     <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-3">
          <div className="flex justify-between items-center"><div className="flex items-center gap-2"><Sparkles size={18} className="text-yellow-400" /><h3 className="font-bold text-slate-200">Conselho da IA</h3></div><Button variant="ghost" onClick={handleFetchAdvice} isLoading={loadingAdvice} className="py-1 px-2 text-xs !w-auto">{loadingAdvice ? '' : 'Novo'}</Button></div>
          {loadingAdvice ? (
            <p className="text-sm text-slate-400 italic animate-pulse">Analisando seus dados...</p>
          ) : (
            <p className="text-sm text-slate-300 italic">"{advice || 'Complete mais turnos para receber conselhos personalizados.'}"</p>
          )}
     </div>

     <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-3">
        <div className="flex justify-between items-center"><div className="flex items-center gap-2"><Target size={18} className="text-yellow-400" /><h3 className="font-bold text-slate-200">Minhas Metas</h3></div><Button variant="ghost" onClick={() => setShowGoalModal(true)} className="py-1 px-2 text-xs !w-auto">Definir</Button></div>
        {activeGoal ? (
            <div>
                <div className="flex justify-between text-sm mb-1"><span className="text-slate-300">Progresso {activeGoal.type === 'weekly' ? 'Semanal' : 'Mensal'}</span><span className="font-bold text-yellow-400">R$ {goalProgress.current.toFixed(2)} / R$ {activeGoal.target.toFixed(2)}</span></div>
                <div className="w-full bg-slate-700 rounded-full h-2.5"><div className="bg-yellow-400 h-2.5 rounded-full" style={{width: `${goalProgress.percentage}%`}}></div></div>
            </div>
        ) : <p className="text-sm text-slate-500 text-center">Defina uma meta de lucro para se manter motivado!</p>}
     </div>
    </>
  );

  const ExpensesView = () => (
    <>
      <div className="flex justify-between items-center">
        <button onClick={() => setFinanceView('dashboard')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ChevronLeft size={20} />
            <span className="font-bold">Voltar ao Painel</span>
        </button>
        <Button onClick={() => setShowExpenseModal(true)} className="!w-auto py-2 px-4 text-sm"><Plus size={16}/> Adicionar</Button>
      </div>
      <div className="space-y-3 mt-4">
        <h3 className="font-bold text-slate-300">Extrato do Período</h3>
        {filteredData.trips.length === 0 && filteredData.expenses.length === 0 ? (
            <p className="text-center text-slate-500 pt-10">Nenhum dado no período selecionado.</p>
        ) : (
            [...filteredData.trips, ...filteredData.expenses]
            .sort((a, b) => new Date('cost' in a ? a.date : (a.endTime || a.startTime)).getTime() - new Date('cost' in b ? b.date : (b.endTime || b.startTime)).getTime())
            .reverse()
            .map(item => {
                if ('status' in item) { // It's a Trip
                    return (
                        <button onClick={() => viewTripDetails(item)} key={item.id} className="w-full text-left bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between items-center hover:border-yellow-400 transition-colors">
                            <div>
                                <p className="font-bold text-white">Turno Finalizado</p>
                                <p className="text-xs text-slate-500">{new Date(item.endTime!).toLocaleString('pt-BR')}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-mono font-bold text-green-400 text-lg">+ R$ {item.earnings?.toFixed(2)}</p>
                                <p className="text-xs font-mono text-yellow-400">Lucro R$ {item.profit?.toFixed(2)}</p>
                            </div>
                        </button>
                    )
                } else { // It's an Expense
                    return (
                         <div key={item.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                           <div>
                                <p className="font-bold text-white">{item.name}</p>
                                <p className="text-xs text-slate-500">{item.category} • {new Date(item.date).toLocaleDateString('pt-BR')}</p>
                           </div>
                           <div className="flex items-center gap-2">
                             <p className="font-mono font-bold text-red-400 text-lg">- R$ {item.cost.toFixed(2)}</p>
                             <button onClick={() => { if (window.confirm('Tem certeza que deseja excluir esta despesa?')) deleteExpense(item.id) }} className="text-slate-500 hover:text-red-400 p-1"><Trash2 size={16}/></button>
                           </div>
                         </div>
                    )
                }
            })
        )}
      </div>
    </>
  );

  return (
    <div className="p-4 space-y-6 pb-24 h-full overflow-y-auto no-scrollbar">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white">Financeiro</h2>
            <HelpTooltip title="Seu Escritório Virtual" content={<><p>Aqui você sabe se está realmente ganhando dinheiro.</p><p>O <strong>Lucro Líquido</strong> desconta automaticamente o combustível (calculado no turno) e as despesas extras que você lançar.</p><p>Use o <strong>Relatório Completo</strong> para fins de comprovação de renda e o <strong>Assistente Fiscal</strong> para monitorar seu limite MEI.</p></>}/>
        </div>
        {financeView === 'dashboard' && 
          <Button onClick={() => setFinanceView('expenses')} variant="secondary" className="!w-auto py-2 px-4 text-sm">Ver Extrato</Button>
        }
      </div>

      {financeView === 'dashboard' && (
        <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2">
            {[{id: 'today', label: 'Hoje'}, {id: 'week', label: '7 Dias'}, {id: 'month', label: 'Mês'}, {id: '3months', label: '3 Meses'}].map(f => (
                <button key={f.id} onClick={() => setFilter(f.id as any)} className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${filter === f.id ? 'bg-yellow-400 text-slate-900' : 'bg-slate-800 text-slate-300'}`}>{f.label}</button>
            ))}
        </div>
      )}

      {!activeVehicle ? (
        <p className="text-center text-slate-500 pt-10">Selecione um veículo no seu perfil para ver os dados financeiros.</p>
      ) : (
        <div className="space-y-4">
          {financeView === 'dashboard' ? <DashboardView /> : <ExpensesView />}
        </div>
      )}
      
      {showGoalModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-sm space-y-4 animate-in zoom-in-95">
                <h3 className="text-xl font-bold text-white">Definir Meta de Lucro</h3>
                <Select label="Tipo de Meta" value={newGoal.type} onChange={e => setNewGoal({...newGoal, type: e.target.value as any})}>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensal</option>
                </Select>
                <Input label="Valor da Meta (R$)" type="number" value={newGoal.target} onChange={e => setNewGoal({...newGoal, target: e.target.value})} autoFocus />
                <div className="flex gap-3 pt-2">
                    <Button variant="secondary" onClick={() => setShowGoalModal(false)}>Cancelar</Button>
                    <Button onClick={handleSetGoal}>Salvar Meta</Button>
                </div>
            </div>
        </div>
      )}

      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-sm space-y-4 animate-in zoom-in-95">
                <h3 className="text-xl font-bold text-white">Adicionar Despesa</h3>
                <Input label="Descrição" value={newExpense.name} onChange={e => setNewExpense({...newExpense, name: e.target.value})} autoFocus />
                <Input label="Custo (R$)" type="number" value={newExpense.cost} onChange={e => setNewExpense({...newExpense, cost: e.target.value})} />
                <Input label="Data" type="date" value={newExpense.date} onChange={e => setNewExpense({...newExpense, date: e.target.value})} />
                <Select label="Categoria" value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value as ExpenseCategory})}>
                    {Object.values(ExpenseCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </Select>
                <div className="flex gap-3 pt-2">
                    <Button variant="secondary" onClick={() => setShowExpenseModal(false)}>Cancelar</Button>
                    <Button onClick={handleAddExpense}>Adicionar</Button>
                </div>
            </div>
        </div>
      )}

      {/* --- MODAL DE RELATÓRIO --- */}
      {showReportModal && (
         <div className="fixed inset-0 bg-white z-[100] p-6 overflow-y-auto text-slate-900 animate-in fade-in">
             <div className="max-w-2xl mx-auto space-y-6">
                 <div className="flex justify-between items-start print:hidden">
                    <div>
                        <h2 className="text-2xl font-bold">Relatório Financeiro</h2>
                        <p className="text-slate-500">Gere um PDF ou imprima para seu controle.</p>
                    </div>
                    <Button variant="ghost" onClick={() => setShowReportModal(false)} className="!w-auto"><X /></Button>
                 </div>

                 <div className="border p-6 rounded-none bg-white">
                     <div className="flex justify-between items-center mb-6 border-b pb-4">
                        <div className="flex items-center gap-2">
                            <Car className="text-slate-900"/>
                            <h1 className="text-xl font-bold uppercase tracking-wide">SouMotorista</h1>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-500">Período</p>
                            <p className="font-bold">{filteredData.start.toLocaleDateString('pt-BR')} - {filteredData.end.toLocaleDateString('pt-BR')}</p>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4 mb-6">
                         <div className="p-4 bg-slate-50 border">
                             <p className="text-xs uppercase text-slate-500 font-bold">Ganhos Totais</p>
                             <p className="text-xl font-bold text-green-600">R$ {metrics.totalEarnings.toFixed(2)}</p>
                         </div>
                         <div className="p-4 bg-slate-50 border">
                             <p className="text-xs uppercase text-slate-500 font-bold">Lucro Líquido</p>
                             <p className="text-xl font-bold text-slate-900">R$ {metrics.netProfit.toFixed(2)}</p>
                         </div>
                         <div className="p-4 bg-slate-50 border">
                             <p className="text-xs uppercase text-slate-500 font-bold">Gastos Totais</p>
                             <p className="text-lg font-bold text-red-600">R$ {metrics.totalCost.toFixed(2)}</p>
                         </div>
                         <div className="p-4 bg-slate-50 border">
                             <p className="text-xs uppercase text-slate-500 font-bold">Lucro por KM</p>
                             <p className="text-lg font-bold text-slate-900">R$ {metrics.profitPerKm.toFixed(2)}</p>
                         </div>
                     </div>

                     <div className="space-y-4">
                         <h3 className="font-bold uppercase text-sm border-b pb-2">Detalhamento</h3>
                         <table className="w-full text-sm text-left">
                             <thead className="text-slate-500 font-medium border-b">
                                 <tr>
                                     <th className="pb-2">Data</th>
                                     <th className="pb-2">Descrição</th>
                                     <th className="pb-2 text-right">Valor</th>
                                 </tr>
                             </thead>
                             <tbody className="divide-y">
                                 {[...filteredData.trips, ...filteredData.expenses]
                                    .sort((a, b) => new Date('cost' in a ? a.date : (a.endTime || a.startTime)).getTime() - new Date('cost' in b ? b.date : (b.endTime || b.startTime)).getTime())
                                    .map(item => (
                                     <tr key={item.id}>
                                         <td className="py-2 text-slate-600">
                                            {new Date('cost' in item ? item.date : item.endTime!).toLocaleDateString('pt-BR')}
                                         </td>
                                         <td className="py-2">
                                            {'status' in item ? 'Turno Finalizado' : item.name}
                                         </td>
                                         <td className={`py-2 text-right font-mono ${'status' in item ? 'text-green-600' : 'text-red-600'}`}>
                                            {'status' in item ? `+ R$ ${item.earnings?.toFixed(2)}` : `- R$ ${item.cost.toFixed(2)}`}
                                         </td>
                                     </tr>
                                 ))}
                             </tbody>
                         </table>
                     </div>
                 </div>

                 <div className="flex gap-4 print:hidden">
                     <Button onClick={() => window.print()} className="bg-slate-900 text-white hover:bg-slate-800">
                         <Printer size={18} /> Imprimir / Salvar PDF
                     </Button>
                     <Button variant="secondary" onClick={() => setShowReportModal(false)}>
                         Fechar
                     </Button>
                 </div>
             </div>
         </div>
      )}

      {/* --- MODAL DE ASSISTENTE FISCAL (MEI) --- */}
      {showFiscalModal && (
        <div className="fixed inset-0 bg-slate-950 z-[100] p-6 overflow-y-auto text-white animate-in slide-in-from-bottom">
            <div className="max-w-md mx-auto space-y-6 pb-20">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold flex items-center gap-2 text-yellow-400"><Building2 /> Assistente Fiscal MEI</h2>
                    <Button variant="ghost" onClick={() => setShowFiscalModal(false)} className="!w-auto"><X /></Button>
                </div>

                <div className="bg-slate-900 p-5 rounded-xl border border-slate-700 space-y-4">
                     <div className="flex justify-between items-center">
                        <h3 className="font-bold text-lg">Limite Anual MEI</h3>
                        <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400">R$ 81.000,00</span>
                     </div>
                     <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-400">Acumulado {new Date().getFullYear()}</span>
                            <span className={`font-bold ${meiProgress > 80 ? 'text-red-400' : 'text-green-400'}`}>R$ {totalYearEarnings.toFixed(2)} ({meiProgress.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden border border-slate-700">
                            <div className={`h-full transition-all duration-1000 ${meiProgress > 90 ? 'bg-red-500' : (meiProgress > 75 ? 'bg-yellow-400' : 'bg-green-500')}`} style={{width: `${meiProgress}%`}}></div>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">Dica: Se ultrapassar 80% (R$ 64.800), consulte um contador para evitar multas.</p>
                     </div>
                </div>

                <div className="bg-slate-900 p-5 rounded-xl border border-slate-700 space-y-4">
                     <div className="flex items-center gap-2">
                        <CheckSquare className="text-yellow-400" size={20}/>
                        <h3 className="font-bold text-lg">Controle de DAS (Mensal)</h3>
                     </div>
                     <p className="text-sm text-slate-400">Marque as guias que você já pagou este ano.</p>
                     <div className="grid grid-cols-3 gap-2">
                        {Array.from({length: 12}).map((_, i) => {
                            const monthName = new Date(0, i).toLocaleString('pt-BR', {month: 'short'}).toUpperCase();
                            const isPaid = paidMonths[`${new Date().getFullYear()}-${i}`];
                            return (
                                <button 
                                    key={i}
                                    onClick={() => setPaidMonths(prev => ({...prev, [`${new Date().getFullYear()}-${i}`]: !isPaid}))}
                                    className={`p-2 rounded-lg border text-sm font-bold transition-all ${isPaid ? 'bg-green-900/40 border-green-500 text-green-400' : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-500'}`}
                                >
                                    {monthName} {isPaid && <CheckCircle size={12} className="inline ml-1"/>}
                                </button>
                            )
                        })}
                     </div>
                </div>

                <div className="bg-gradient-to-br from-blue-900/40 to-slate-900 p-5 rounded-xl border border-blue-500/30 space-y-4">
                     <div className="flex items-center gap-2">
                        <ExternalLink className="text-blue-400" size={20}/>
                        <h3 className="font-bold text-lg">Links Úteis</h3>
                     </div>
                     <p className="text-sm text-slate-400">Acesse os portais oficiais para mais informações e para emitir suas guias.</p>
                     <div className="space-y-2">
                        <a href="https://www.gov.br/empresas-e-negocios/pt-br/empreendedor" target="_blank" rel="noopener noreferrer" className="flex justify-between items-center bg-slate-800 hover:bg-slate-700 p-3 rounded-lg w-full transition-colors text-left">
                            <span className="font-medium text-blue-300">Portal do Empreendedor</span>
                            <ChevronRight size={18} className="text-slate-500"/>
                        </a>
                        <a href="https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/servicos-para-mei/pagamento-de-contribuicao-mensal/pagamento-de-contribuicao-mensal" target="_blank" rel="noopener noreferrer" className="flex justify-between items-center bg-slate-800 hover:bg-slate-700 p-3 rounded-lg w-full transition-colors text-left">
                            <span className="font-medium text-blue-300">Emitir Guia DAS</span>
                             <ChevronRight size={18} className="text-slate-500"/>
                        </a>
                     </div>
                </div>

                 <Button variant="secondary" onClick={() => setShowFiscalModal(false)} className="mt-4">
                     Fechar Assistente Fiscal
                 </Button>
            </div>
        </div>
      )}
    </div>
  );
};

interface PartnersScreenProps {
  partners: Partner[];
  user: UserProfile;
}
const PartnersScreen: React.FC<PartnersScreenProps> = ({ partners, user }) => {
  
  const categories = useMemo(() => {
    const cats = partners.map(p => p.category);
    return [...new Set(cats)];
  }, [partners]);

  const categoryIcons: {[key: string]: React.ReactNode} = {
    'Autopeças': <Wrench size={20} className="text-blue-400"/>,
    'Serviços': <Car size={20} className="text-green-400"/>,
    'Alimentação': <Utensils size={20} className="text-red-400"/>,
    'Combustível': <Fuel size={20} className="text-orange-400"/>,
    'Outros': <ShoppingBag size={20} className="text-purple-400"/>
  };

  const handleOpenMaps = (partner: Partner) => {
    let url = '';
    if (partner.name === 'LigaAqui Celulares') {
        url = 'https://maps.app.goo.gl/69wY9a4rvSSsxW5Q7';
    } else {
        if (!partner.address && (!partner.latitude || !partner.longitude)) {
            alert('Localização não disponível para este parceiro.');
            return;
        }
        const query = partner.latitude && partner.longitude 
          ? `${partner.latitude},${partner.longitude}` 
          : encodeURIComponent(partner.address!);
        url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    }
    window.open(url, '_blank');
  };

  const handleShare = async (partner: Partner) => {
    let shareText = `Olá! Vi essa oferta no app #SouMotorista e tenho interesse.\n\n*${partner.name}*\n${partner.benefit}\n\nMeu ID de motorista para o desconto é: *${user.userId}*`;
    
    if (partner.whatsapp) {
      const whatsappUrl = `https://wa.me/${partner.whatsapp}?text=${encodeURIComponent(shareText)}`;
      window.open(whatsappUrl, '_blank');
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Parceiro SouMotorista: ${partner.name}`,
          text: shareText,
        });
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          console.error('Erro ao compartilhar', error);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        alert('Informações do parceiro copiadas para a área de transferência!');
      } catch (err) {
        alert('Não foi possível compartilhar ou copiar as informações.');
      }
    }
  };

  return (
    <div className="p-4 space-y-6 pb-24 h-full overflow-y-auto no-scrollbar">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-white">Parceiros</h2>
          <HelpTooltip title="Clube de Vantagens" content={<>
            <p>Apresente o seu Perfil no app (com seu ID #SouMotorista) nos estabelecimentos parceiros para ganhar os descontos anunciados.</p>
            <p className="mt-2 text-yellow-400 font-bold">Atenção:</p>
            <p>Os benefícios são de responsabilidade exclusiva dos parceiros. O app #SouMotorista apenas divulga as ofertas.</p>
          </>} />
        </div>
      </div>
      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
        <p className="text-sm text-slate-300">Apresente seu perfil com ID para obter os descontos!</p>
      </div>
      <div className="space-y-4">
        {categories.map(category => (
          <div key={category}>
            <div className="flex items-center gap-2 mb-2">
              {categoryIcons[category] || categoryIcons['Outros']}
              <h3 className="font-bold text-slate-300">{category}</h3>
            </div>
            <div className="space-y-3">
              {partners.filter(p => p.category === category).map(partner => (
                <div key={partner.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col gap-3">
                  <div>
                    <p className="font-bold text-white">{partner.name}</p>
                    <p className="text-sm text-yellow-400 font-medium mt-1">{partner.benefit}</p>
                    {partner.address && <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5"><MapPin size={12}/> {partner.address}</p>}
                  </div>
                  <div className="border-t border-slate-800 pt-3 flex gap-2">
                     <Button onClick={() => handleOpenMaps(partner)} variant="secondary" className="!w-full !py-2 !text-sm">
                        <MapPin size={16}/> IR A LOJA
                     </Button>
                     <Button onClick={() => handleShare(partner)} variant="secondary" className="!w-full !py-2 !text-sm">
                        <Share2 size={16}/> Compartilhar
                     </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


interface ProfileScreenProps {
  state: AppState;
  activeVehicle: Vehicle | null;
  setActiveVehicleId: (id: string) => void;
  updateUser: (u: Partial<UserProfile>) => void;
  updateVehicle: (v: Partial<Vehicle>) => void;
  addVehicle: (v: Omit<Vehicle, 'id' | 'trips' | 'maintenance' | 'activeTripId'>) => void;
  deleteVehicle: (id: string) => void;
  logout: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ state, activeVehicle, setActiveVehicleId, updateUser, updateVehicle, addVehicle, deleteVehicle, logout }) => {
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [isAddingNewVehicle, setIsAddingNewVehicle] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);

  const handleLogout = () => {
    if (window.confirm("Tem certeza que deseja sair? Todos os seus dados locais serão apagados.")) {
      logout();
    }
  };

  const EditUserModal = ({ onSave, onCancel }: { onSave: (u: Partial<UserProfile>) => void, onCancel: () => void }) => {
      const [user, setUserData] = useState(state.user);
      return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-sm space-y-4">
              <h3 className="text-xl font-bold text-white">Editar Perfil</h3>
              <Input label="Nome" value={user.firstName} onChange={e => setUserData({...user, firstName: e.target.value})} />
              <Input label="Sobrenome" value={user.lastName} onChange={e => setUserData({...user, lastName: e.target.value})} />
              <Input label="WhatsApp" value={user.whatsapp || ''} onChange={e => setUserData({...user, whatsapp: e.target.value})} />
              <div className="flex gap-3 pt-2">
                  <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
                  <Button onClick={() => { onSave(user); onCancel(); }}>Salvar</Button>
              </div>
          </div>
        </div>
      )
  };

  const EditVehicleModal = ({ vehicle, onSave, onDelete, onComplete }: { vehicle: Vehicle, onSave: (v: Partial<Vehicle>) => void, onDelete: (id: string) => void, onComplete: () => void }) => {
      const [formData, setFormData] = useState(vehicle);
      return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-sm space-y-4">
                <h3 className="text-xl font-bold text-white">Editar Veículo</h3>
                <Input label="Placa" value={formData.plate} onChange={e => setFormData({...formData, plate: e.target.value.toUpperCase()})} />
                <Input label="Consumo Cidade (km/l)" type="number" value={formData.avgConsumptionCity} onChange={e => setFormData({...formData, avgConsumptionCity: parseFloat(e.target.value)})} />
                <Input label="Consumo Estrada (km/l)" type="number" value={formData.avgConsumptionHighway} onChange={e => setFormData({...formData, avgConsumptionHighway: parseFloat(e.target.value)})} />
                <div className="flex gap-3 pt-2">
                    <Button variant="danger" onClick={() => { if(window.confirm('Tem certeza? Isso apagará o veículo e todos os seus dados.')) { onDelete(vehicle.id); onComplete(); }}}>Excluir</Button>
                    <Button variant="secondary" onClick={onComplete}>Cancelar</Button>
                    <Button onClick={() => { onSave(formData); onComplete(); }}>Salvar</Button>
                </div>
            </div>
        </div>
      );
  };
  
  if (isAddingNewVehicle) {
    return <SetupScreen 
      user={state.user} 
      updateUser={updateUser} 
      addVehicle={(v) => { addVehicle(v); setIsAddingNewVehicle(false); }}
      isAddingNewVehicle={true}
      onDone={() => setIsAddingNewVehicle(false)}
    />
  }

  return (
    <div className="p-4 space-y-6 pb-24 h-full overflow-y-auto no-scrollbar">
      {isEditingUser && <EditUserModal onSave={updateUser} onCancel={() => setIsEditingUser(false)} />}
      {editingVehicleId && <EditVehicleModal vehicle={state.vehicles.find(v => v.id === editingVehicleId)!} onSave={updateVehicle} onDelete={deleteVehicle} onComplete={() => setEditingVehicleId(null)} />}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Meu Perfil</h2>
      </div>

      <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-white">{state.user.firstName} {state.user.lastName}</h3>
            <p className="text-sm font-mono text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded w-fit mt-1">ID: {state.user.userId}</p>
          </div>
          <Button variant="ghost" className="!w-auto p-2" onClick={() => setIsEditingUser(true)}><Edit size={18} /></Button>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="font-bold text-slate-300">Meus Veículos</h3>
        {state.vehicles.map(v => (
          <div key={v.id} className={`p-4 rounded-xl border transition-all ${activeVehicle?.id === v.id ? 'bg-yellow-400/10 border-yellow-400/50' : 'bg-slate-800 border-slate-700'}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-white">{v.model}</p>
                <p className="text-sm text-slate-400">{v.year}</p>
              </div>
              <div className="flex items-center gap-2">
                {activeVehicle?.id !== v.id && (
                  <Button onClick={() => setActiveVehicleId(v.id)} className="!w-auto py-1 px-3 text-xs bg-slate-700 text-white hover:bg-slate-600">Usar</Button>
                )}
                <Button variant="ghost" className="!w-auto p-2" onClick={() => setEditingVehicleId(v.id)}><Edit size={16} /></Button>
              </div>
            </div>
          </div>
        ))}
        <Button onClick={() => setIsAddingNewVehicle(true)} variant="secondary" className="w-full"><Plus size={16} /> Adicionar Novo Veículo</Button>
      </div>

      <div className="bg-red-900/20 p-5 rounded-xl border border-red-500/30 space-y-3">
        <h3 className="font-bold text-lg flex items-center gap-2 text-red-300"><LogOut /> Sair da Conta</h3>
        <p className="text-sm text-red-200/80">Ao sair, todos os dados salvos neste aparelho serão removidos permanentemente.</p>
        <Button variant="danger" onClick={handleLogout}>Sair e Apagar Dados</Button>
      </div>
    </div>
  );
};


interface TripDetailModalProps {
    trip: Trip | null;
    onClose: () => void;
}

const TripDetailModal: React.FC<TripDetailModalProps> = ({ trip, onClose }) => {
    if (!trip) return null;

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-sm space-y-4 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center border-b border-slate-700 pb-3">
                    <h3 className="text-xl font-bold text-white">Detalhes do Turno</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={24} /></button>
                </div>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-400">Data</span><span className="font-medium text-white">{new Date(trip.endTime!).toLocaleString('pt-BR')}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Duração</span><span className="font-medium text-white">{((new Date(trip.endTime!).getTime() - new Date(trip.startTime).getTime()) / 3600000).toFixed(1)} horas</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Distância</span><span className="font-medium text-white">{trip.distance?.toFixed(1)} km</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Consumo Médio</span><span className="font-medium text-white">{trip.consumption?.toFixed(1)} km/l</span></div>
                    <hr className="border-slate-700 my-2" />
                    <div className="flex justify-between text-base"><span className="text-slate-400">Ganho Bruto</span><span className="font-bold text-green-400">R$ {trip.earnings?.toFixed(2)}</span></div>
                    <div className="flex justify-between text-base"><span className="text-slate-400">Custo Combustível</span><span className="font-bold text-red-400">- R$ {trip.cost?.toFixed(2)}</span></div>
                    <hr className="border-slate-700 my-2" />
                    <div className="flex justify-between text-lg"><span className="text-slate-300">Lucro Líquido</span><span className="font-bold text-yellow-400">R$ {trip.profit?.toFixed(2)}</span></div>
                </div>
                <Button variant="secondary" onClick={onClose}>Fechar</Button>
            </div>
        </div>
    );
};

interface TurnoSummaryModalProps {
    lastTrip: Trip | null;
    dailySummary: { earnings: string; profit: string; distance: string; duration: string; };
    onClose: () => void;
}

const TurnoSummaryModal: React.FC<TurnoSummaryModalProps> = ({ lastTrip, dailySummary, onClose }) => {
    if (!lastTrip) return null;
    
    const tripDurationMs = new Date(lastTrip.endTime!).getTime() - new Date(lastTrip.startTime).getTime();
    const tripHours = Math.floor(tripDurationMs / (1000 * 60 * 60));
    const tripMinutes = Math.floor((tripDurationMs % (1000 * 60 * 60)) / (1000 * 60));
    const tripDuration = `${tripHours}h ${tripMinutes}m`;
    
    const StatCard = ({ title, value, icon, colorClass = 'text-white' }: {title: string, value: string, icon: React.ReactNode, colorClass?: string}) => (
        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
            <p className="text-slate-400 text-xs uppercase font-bold flex items-center gap-1.5">{icon} {title}</p>
            <p className={`text-lg font-bold mt-1 ${colorClass}`}>{value}</p>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-sm space-y-5 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                <div className="text-center">
                    <div className="inline-block bg-green-500/10 p-3 rounded-full border-2 border-green-500/30 mb-2">
                      <CheckCircle size={32} className="text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Turno Finalizado com Sucesso!</h3>
                    <p className="text-sm text-slate-400">Ótimo trabalho! Aqui estão seus resultados.</p>
                </div>

                <div className="space-y-3">
                    <h4 className="font-bold text-slate-300 text-sm">Resumo do Turno</h4>
                    <div className="grid grid-cols-2 gap-2">
                        <StatCard title="Ganho Bruto" value={`R$ ${lastTrip.earnings?.toFixed(2)}`} icon={<DollarSign size={12}/>} colorClass="text-green-400"/>
                        <StatCard title="Lucro" value={`R$ ${lastTrip.profit?.toFixed(2)}`} icon={<Wallet size={12}/>} colorClass="text-yellow-400"/>
                        <StatCard title="Distância" value={`${lastTrip.distance?.toFixed(1)} km`} icon={<Route size={12}/>} colorClass="text-blue-400"/>
                        <StatCard title="Duração" value={tripDuration} icon={<Clock size={12}/>} colorClass="text-purple-400"/>
                    </div>
                </div>
                
                 <div className="space-y-3">
                    <h4 className="font-bold text-slate-300 text-sm">Acumulado do Dia</h4>
                    <div className="grid grid-cols-2 gap-2">
                        <StatCard title="Ganho Bruto" value={`R$ ${dailySummary.earnings}`} icon={<DollarSign size={12}/>} colorClass="text-green-400"/>
                        <StatCard title="Lucro" value={`R$ ${dailySummary.profit}`} icon={<Wallet size={12}/>} colorClass="text-yellow-400"/>
                        <StatCard title="Distância" value={`${dailySummary.distance} km`} icon={<Route size={12}/>} colorClass="text-blue-400"/>
                        <StatCard title="Duração" value={dailySummary.duration} icon={<Clock size={12}/>} colorClass="text-purple-400"/>
                    </div>
                </div>

                <Button onClick={onClose} className="mt-2">OK</Button>
            </div>
        </div>
    );
};


const App = () => {
  const [state, setState] = useState<AppState>(() => {
      try {
          const savedState = localStorage.getItem('souMotoristaState');
          return savedState ? JSON.parse(savedState) : initialState;
      } catch {
          return initialState;
      }
  });
  
  useEffect(() => {
      localStorage.setItem('souMotoristaState', JSON.stringify(state));
  }, [state]);

  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'setup' | 'main'>('welcome');
  const [activeTab, setActiveTab] = useState<'home' | 'stations' | 'maint' | 'finance' | 'partners' | 'profile'>('home');
  const [viewingTrip, setViewingTrip] = useState<Trip | null>(null);
  const [shiftSummaryData, setShiftSummaryData] = useState<{ lastTrip: Trip; dailySummary: any } | null>(null);


  useEffect(() => {
      if (state.user.isSetupComplete) {
          setCurrentScreen('main');
      } else if (state.user.userId) {
          setCurrentScreen('setup');
      } else {
          setCurrentScreen('welcome');
      }
  }, [state.user.isSetupComplete, state.user.userId]);

  const activeVehicle = useMemo(() => state.vehicles.find(v => v.id === state.activeVehicleId) || null, [state.vehicles, state.activeVehicleId]);
  
  // --- STATE HANDLERS ---
  const handleUpdateUser = (u: Partial<UserProfile>) => setState(prev => ({ ...prev, user: {...prev.user, ...u} }));
  
  const handleAddVehicle = (v: Omit<Vehicle, 'id'|'trips'|'maintenance'|'activeTripId'>) => {
    const newVehicle: Vehicle = {
      ...v,
      id: Date.now().toString(),
      trips: [],
      maintenance: [],
      activeTripId: null,
    };
    setState(prev => ({
      ...prev,
      vehicles: [...prev.vehicles, newVehicle],
      activeVehicleId: prev.activeVehicleId || newVehicle.id,
    }));
  };
  
  const handleUpdateVehicle = (updatedVehicle: Partial<Vehicle>) => {
    setState(prev => ({
      ...prev,
      vehicles: prev.vehicles.map(v => v.id === updatedVehicle.id ? { ...v, ...updatedVehicle } : v),
    }));
  };
  
  const handleDeleteVehicle = (id: string) => {
    setState(prev => ({
      ...prev,
      vehicles: prev.vehicles.filter(v => v.id !== id),
      activeVehicleId: prev.activeVehicleId === id ? (prev.vehicles.length > 1 ? prev.vehicles.filter(v=>v.id !== id)[0].id : null) : prev.activeVehicleId,
    }));
  };

  const handleStartTrip = (startOdometer: number) => {
    if (!state.activeVehicleId) return;
    const newTrip: Trip = {
      id: Date.now().toString(), startTime: new Date().toISOString(), startOdometer, status: 'active',
    };
    setState(prev => ({
      ...prev,
      vehicles: prev.vehicles.map(v => v.id === prev.activeVehicleId ? { ...v, trips: [...v.trips, newTrip], activeTripId: newTrip.id } : v)
    }));
  };

  const handleEndTrip = (earnings: number, endOdometer: number) => {
    const favoriteStation = state.stations.find(s => s.isFavorite);
    if (!activeVehicle || !activeVehicle.activeTripId || !favoriteStation) return;
    const activeTrip = activeVehicle.trips.find(t => t.id === activeVehicle.activeTripId);
    if (!activeTrip) return;

    const distance = endOdometer - activeTrip.startOdometer;
    const consumption = distance > 0 ? (distance / ((distance / activeVehicle.avgConsumptionCity))) : 0;
    const fuelCost = (distance / activeVehicle.avgConsumptionCity) * favoriteStation.price;
    const profit = earnings - fuelCost;

    const updatedTrip: Trip = { ...activeTrip, endTime: new Date().toISOString(), endOdometer, distance, earnings, cost: fuelCost, profit, status: 'completed', fuelPriceUsed: favoriteStation.price, consumption: distance > 0 ? (distance / (fuelCost / favoriteStation.price)) : 0 };

    const today = new Date().toDateString();
    const previousTodayTrips = activeVehicle.trips.filter(t => 
        t.status === 'completed' && t.endTime && new Date(t.endTime).toDateString() === today
    );
    const allTodayTrips = [...previousTodayTrips, updatedTrip];

    const dailyEarnings = allTodayTrips.reduce((acc, curr) => acc + (curr.earnings || 0), 0);
    const dailyProfit = allTodayTrips.reduce((acc, curr) => acc + (curr.profit || 0), 0);
    const dailyDistance = allTodayTrips.reduce((acc, curr) => acc + (curr.distance || 0), 0);
    const dailyDurationMs = allTodayTrips.reduce((acc, curr) => curr.endTime ? acc + (new Date(curr.endTime).getTime() - new Date(curr.startTime).getTime()) : acc, 0);

    const hours = Math.floor(dailyDurationMs / (1000 * 60 * 60));
    const minutes = Math.floor((dailyDurationMs % (1000 * 60 * 60)) / (1000 * 60));

    const dailySummary = {
      earnings: dailyEarnings.toFixed(2),
      profit: dailyProfit.toFixed(2),
      distance: dailyDistance.toFixed(1),
      duration: `${hours}h ${minutes}m`
    };

    setShiftSummaryData({ lastTrip: updatedTrip, dailySummary });

    setState(prev => ({
      ...prev,
      vehicles: prev.vehicles.map(v => v.id === prev.activeVehicleId ? { ...v, trips: v.trips.map(t => t.id === activeTrip.id ? updatedTrip : t), activeTripId: null } : v)
    }));
  };

  const handleAddStation = (s: GasStation) => setState(prev => ({...prev, stations: [...prev.stations, s]}));
  const handleToggleFavorite = (id: string) => setState(prev => ({...prev, stations: prev.stations.map(s => ({...s, isFavorite: s.id === id}))}));
  const handleDeleteStation = (id: string) => setState(prev => ({...prev, stations: prev.stations.filter(s => s.id !== id)}));
  
  const handleAddMaintenance = (m: MaintenanceItem) => {
    setState(prev => ({ ...prev, vehicles: prev.vehicles.map(v => v.id === prev.activeVehicleId ? {...v, maintenance: [...v.maintenance, m]} : v) }));
  }

  const handleAddExpense = (e: Omit<Expense, 'id'|'vehicleId'>) => {
    if(!state.activeVehicleId) return;
    const newExpense: Expense = {...e, id: Date.now().toString(), vehicleId: state.activeVehicleId };
    setState(prev => ({...prev, expenses: [...prev.expenses, newExpense]}));
  }

  const handleDeleteExpense = (id: string) => setState(prev => ({...prev, expenses: prev.expenses.filter(e => e.id !== id)}));

  const handleSetGoal = (g: Omit<Goal, 'id'|'vehicleId'|'startDate'>) => {
    if(!state.activeVehicleId) return;
    const newGoal: Goal = {...g, id: Date.now().toString(), vehicleId: state.activeVehicleId, startDate: new Date().toISOString()};
    setState(prev => ({...prev, goals: prev.goals.filter(goal => goal.vehicleId !== state.activeVehicleId).concat(newGoal)}));
  };
  
  const handleLogout = () => {
    localStorage.removeItem('souMotoristaState');
    setState(initialState);
    setCurrentScreen('welcome');
  };

  // --- RENDER LOGIC ---
  if (currentScreen === 'welcome') {
    return <WelcomeScreen 
      onStart={() => { handleUpdateUser({ userId: `SM-${Date.now().toString().slice(-7)}` }); setCurrentScreen('setup'); }} 
      onLogin={() => alert('Login com Google em breve!')}
    />;
  }

  if (currentScreen === 'setup') {
    return <SetupScreen 
      user={state.user} 
      updateUser={handleUpdateUser}
      addVehicle={handleAddVehicle}
      onDone={() => setCurrentScreen('main')}
    />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <HomeScreen state={state} activeVehicle={activeVehicle} startTrip={handleStartTrip} endTrip={handleEndTrip} navigateTo={setActiveTab} />;
      case 'stations': return <StationsScreen state={state} addStation={handleAddStation} toggleFavoriteStation={handleToggleFavorite} deleteStation={handleDeleteStation} />;
      case 'maint': return <MaintenanceScreen state={state} activeVehicle={activeVehicle} addMaintenance={handleAddMaintenance} />;
      case 'finance': return <FinancialScreen state={state} activeVehicle={activeVehicle} addExpense={handleAddExpense} deleteExpense={handleDeleteExpense} setGoal={handleSetGoal} viewTripDetails={setViewingTrip}/>;
      case 'partners': return <PartnersScreen partners={state.partners} user={state.user} />;
      case 'profile': return <ProfileScreen state={state} activeVehicle={activeVehicle} setActiveVehicleId={(id) => setState(p => ({...p, activeVehicleId: id}))} updateUser={handleUpdateUser} updateVehicle={handleUpdateVehicle} addVehicle={handleAddVehicle} deleteVehicle={handleDeleteVehicle} logout={handleLogout} />;
      default: return null;
    }
  };

  const NavItem = ({ tab, icon: Icon, label }: {tab: typeof activeTab, icon: React.ElementType, label: string}) => (
    <button onClick={() => setActiveTab(tab)} className={`flex flex-col items-center justify-center gap-1 w-full transition-colors ${activeTab === tab ? 'text-yellow-400' : 'text-slate-400 hover:text-white'}`}>
      <Icon size={24} strokeWidth={activeTab === tab ? 2.5 : 2} />
      <span className={`text-[10px] font-bold ${activeTab === tab ? '' : 'text-slate-500'}`}>{label}</span>
    </button>
  );

  return (
    <div className="h-full w-full flex flex-col bg-slate-900">
      <main className="flex-1 overflow-y-auto no-scrollbar">{renderContent()}</main>

      <TripDetailModal trip={viewingTrip} onClose={() => setViewingTrip(null)} />
      
      {shiftSummaryData && <TurnoSummaryModal 
        lastTrip={shiftSummaryData.lastTrip}
        dailySummary={shiftSummaryData.dailySummary}
        onClose={() => setShiftSummaryData(null)}
      />}

      <footer className="fixed bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-sm border-t border-slate-800 p-2 z-40">
        <nav className="flex justify-around items-start max-w-md mx-auto">
          <NavItem tab="home" icon={Car} label="Início" />
          <NavItem tab="stations" icon={Fuel} label="Postos" />
          <NavItem tab="maint" icon={Wrench} label="Manutenção" />
          <NavItem tab="finance" icon={DollarSign} label="Financeiro" />
          <NavItem tab="partners" icon={Handshake} label="Parceiros" />
          <NavItem tab="profile" icon={User} label="Perfil" />
        </nav>
      </footer>
    </div>
  );
};

export default App;
