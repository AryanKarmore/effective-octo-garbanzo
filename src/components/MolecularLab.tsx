import { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Microscope, 
  Dna, 
  Play, 
  RotateCcw, 
  Info
} from 'lucide-react';
import * as THREE from 'three';

// HIV Protein Structures
const PROTEINS = {
  protease: {
    name: 'HIV-1 Protease',
    description: 'Aspartic protease essential for viral maturation',
    pdbId: '1HSG',
    color: '#ef4444',
    bindingSites: ['Active Site (Asp25, Thr26, Gly27)', 'Flap Region', 'Substrate Binding Cleft']
  },
  integrase: {
    name: 'HIV-1 Integrase',
    description: 'Catalyzes viral DNA integration into host genome',
    pdbId: '1BIS',
    color: '#8b5cf6',
    bindingSites: ['Catalytic Core (D64, D116, E152)', 'DNA Binding Domain', 'C-Terminal Domain']
  },
  reverse_transcriptase: {
    name: 'Reverse Transcriptase',
    description: 'Converts viral RNA to DNA',
    pdbId: '1RTD',
    color: '#06b6d4',
    bindingSites: ['Polymerase Active Site', 'RNase H Domain', 'NNRTI Binding Pocket']
  },
  capsid: {
    name: 'HIV-1 Capsid',
    description: 'Protects viral RNA genome',
    pdbId: '1AK4',
    color: '#10b981',
    bindingSites: ['N-Terminal Domain', 'C-Terminal Domain', 'Hexamer Interface']
  }
};

const DRUGS: Record<string, { name: string; target: string; class: string; color: string }> = {
  DTG: { name: 'Dolutegravir', target: 'integrase', class: 'INSTI', color: '#06b6d4' },
  BIC: { name: 'Bictegravir', target: 'integrase', class: 'INSTI', color: '#06b6d4' },
  RAL: { name: 'Raltegravir', target: 'integrase', class: 'INSTI', color: '#06b6d4' },
  ATV: { name: 'Atazanavir', target: 'protease', class: 'PI', color: '#ef4444' },
  DRV: { name: 'Darunavir', target: 'protease', class: 'PI', color: '#ef4444' },
  RPV: { name: 'Rilpivirine', target: 'reverse_transcriptase', class: 'NNRTI', color: '#8b5cf6' },
  EFV: { name: 'Efavirenz', target: 'reverse_transcriptase', class: 'NNRTI', color: '#8b5cf6' },
  LEN: { name: 'Lenacapavir', target: 'capsid', class: 'Capsid Inhibitor', color: '#10b981' }
};

// 3D Components
function ProteinStructure({ protein, isBinding }: { protein: string; isBinding: boolean }) {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      if (isBinding) {
        meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      }
    }
  });

  const proteinData = PROTEINS[protein as keyof typeof PROTEINS];
  const color = proteinData?.color || '#3b82f6';

  return (
    <group ref={meshRef}>
      {/* Main protein body - represented as a complex shape */}
      <mesh position={[0, 0, 0]}>
        <dodecahedronGeometry args={[2, 1]} />
        <meshStandardMaterial 
          color={color} 
          wireframe 
          transparent 
          opacity={0.6}
        />
      </mesh>
      
      {/* Inner core */}
      <mesh position={[0, 0, 0]}>
        <icosahedronGeometry args={[1.5, 0]} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.2}
        />
      </mesh>

      {/* Binding sites */}
      {proteinData?.bindingSites.map((_, i) => (
        <mesh key={i} position={[
          Math.sin(i * 2.1) * 2.5,
          Math.cos(i * 1.5) * 2.5,
          Math.sin(i * 1.2) * 2.5
        ]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial 
            color="#fbbf24" 
            emissive="#f59e0b"
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}

      {/* Active site highlight */}
      <mesh position={[0, 0, 2.2]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial 
          color="#fbbf24"
          emissive="#f59e0b"
          emissiveIntensity={0.8}
          transparent
          opacity={0.7}
        />
      </mesh>
    </group>
  );
}

function DrugMolecule({ 
  drug, 
  isAnimating, 
  targetPosition 
}: { 
  drug: string; 
  isAnimating: boolean;
  targetPosition: [number, number, number];
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const drugData = DRUGS[drug];
  
  useFrame((state) => {
    if (meshRef.current) {
      if (isAnimating) {
        // Move towards binding site
        meshRef.current.position.lerp(new THREE.Vector3(...targetPosition), 0.02);
        meshRef.current.rotation.x += 0.05;
        meshRef.current.rotation.y += 0.05;
      } else {
        // Float animation
        meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.5 + 4;
        meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      }
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 4, 0]}>
      <octahedronGeometry args={[0.8, 0]} />
      <meshStandardMaterial 
        color={drugData?.color || '#3b82f6'}
        emissive={drugData?.color || '#3b82f6'}
        emissiveIntensity={0.3}
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  );
}

function Scene({ protein, drug, isBinding }: { protein: string; drug: string; isBinding: boolean }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#06b6d4" />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <ProteinStructure protein={protein} isBinding={isBinding} />
      
      {drug && (
        <DrugMolecule 
          drug={drug} 
          isAnimating={isBinding}
          targetPosition={[0, 0, 2.2]}
        />
      )}
      
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
    </>
  );
}

export function MolecularLab() {
  const [selectedProtein, setSelectedProtein] = useState<keyof typeof PROTEINS>('integrase');
  const [selectedDrug, setSelectedDrug] = useState<keyof typeof DRUGS>('DTG');
  const [isSimulating, setIsSimulating] = useState(false);
  const [showBinding, setShowBinding] = useState(false);

  const handleSimulate = () => {
    setIsSimulating(true);
    setShowBinding(true);
    setTimeout(() => {
      setIsSimulating(false);
    }, 3000);
  };

  const handleReset = () => {
    setShowBinding(false);
    setIsSimulating(false);
  };

  const proteinData = PROTEINS[selectedProtein];
  const drugData = DRUGS[selectedDrug];
  const isCompatible = drugData?.target === selectedProtein;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Panel */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-pink-400">
              <Microscope className="w-5 h-5" />
              Molecular Simulation
            </CardTitle>
            <CardDescription>
              Visualize drug-protein interactions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">
                HIV Protein Target
              </label>
              <Select value={selectedProtein} onValueChange={(v) => setSelectedProtein(v as keyof typeof PROTEINS)}>
                <SelectTrigger className="bg-slate-950 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  {Object.entries(PROTEINS).map(([key, data]) => (
                    <SelectItem key={key} value={key}>
                      {data.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">
                ARV Drug
              </label>
              <Select value={selectedDrug} onValueChange={(v) => setSelectedDrug(v as keyof typeof DRUGS)}>
                <SelectTrigger className="bg-slate-950 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  {Object.entries(DRUGS).map(([key, data]) => (
                    <SelectItem key={key} value={key}>
                      {data.name} ({key})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleSimulate}
                disabled={isSimulating}
                className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600"
              >
                <Play className="w-4 h-4 mr-2" />
                {isSimulating ? 'Simulating...' : 'Simulate Binding'}
              </Button>
              <Button 
                onClick={handleReset}
                variant="outline"
                className="border-slate-700"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-4 bg-slate-950/50 rounded-lg border border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-300">Compatibility</span>
              </div>
              {isCompatible ? (
                <Badge className="bg-emerald-500/20 text-emerald-400">
                  <Dna className="w-3 h-3 mr-1" />
                  Target Match
                </Badge>
              ) : (
                <Badge className="bg-amber-500/20 text-amber-400">
                  Off-Target
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 3D Viewer */}
        <Card className="bg-slate-900/50 border-slate-800 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-cyan-400">
                <Dna className="w-5 h-5" />
                3D Visualization
              </span>
              <Badge variant="outline" className="text-xs">
                PDB: {proteinData.pdbId}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] bg-slate-950 rounded-lg overflow-hidden">
              <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
                <Suspense fallback={null}>
                  <Scene 
                    protein={selectedProtein} 
                    drug={selectedDrug}
                    isBinding={showBinding}
                  />
                </Suspense>
              </Canvas>
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center">
              Drag to rotate • Scroll to zoom • Right-click to pan
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Protein Information */}
      <Tabs defaultValue="structure" className="space-y-4">
        <TabsList className="bg-slate-900/50">
          <TabsTrigger value="structure">Protein Structure</TabsTrigger>
          <TabsTrigger value="binding">Binding Sites</TabsTrigger>
          <TabsTrigger value="mechanism">Mechanism</TabsTrigger>
        </TabsList>

        <TabsContent value="structure">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle>{proteinData.name}</CardTitle>
              <CardDescription>{proteinData.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-950/50 rounded-lg">
                  <p className="text-xs text-slate-400">PDB ID</p>
                  <p className="text-lg font-mono text-cyan-400">{proteinData.pdbId}</p>
                </div>
                <div className="p-3 bg-slate-950/50 rounded-lg">
                  <p className="text-xs text-slate-400">Resolution</p>
                  <p className="text-lg font-mono text-purple-400">2.0 Å</p>
                </div>
                <div className="p-3 bg-slate-950/50 rounded-lg">
                  <p className="text-xs text-slate-400">Chains</p>
                  <p className="text-lg font-mono text-emerald-400">2 (A/B)</p>
                </div>
                <div className="p-3 bg-slate-950/50 rounded-lg">
                  <p className="text-xs text-slate-400">Ligands</p>
                  <p className="text-lg font-mono text-amber-400">1</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="binding">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle>Key Binding Sites</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {proteinData.bindingSites.map((site, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-slate-950/50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <span className="text-amber-400 font-mono text-sm">{index + 1}</span>
                    </div>
                    <span className="text-slate-300">{site}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mechanism">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle>Drug Mechanism</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-slate-950/50 rounded-lg">
                    <p className="text-xs text-slate-400">Drug</p>
                    <p className="text-lg font-semibold" style={{ color: drugData.color }}>
                      {drugData.name}
                    </p>
                    <Badge className="mt-1" style={{ backgroundColor: drugData.color + '30', color: drugData.color }}>
                      {drugData.class}
                    </Badge>
                  </div>
                  <div className="text-2xl text-slate-600">→</div>
                  <div className="p-4 bg-slate-950/50 rounded-lg">
                    <p className="text-xs text-slate-400">Target</p>
                    <p className="text-lg font-semibold text-cyan-400">
                      {PROTEINS[drugData.target as keyof typeof PROTEINS]?.name || drugData.target}
                    </p>
                    <Badge className="mt-1 bg-cyan-500/20 text-cyan-400">
                      {isCompatible ? 'Primary Target' : 'Off-Target'}
                    </Badge>
                  </div>
                </div>
                
                <div className="p-4 bg-slate-950/50 rounded-lg">
                  <p className="text-sm text-slate-300">
                    {drugData.name} is a {drugData.class} that 
                    {isCompatible 
                      ? ` specifically targets the ${proteinData.name.toLowerCase()}, inhibiting its function and preventing viral replication.`
                      : ` primarily targets ${PROTEINS[drugData.target as keyof typeof PROTEINS]?.name?.toLowerCase() || drugData.target}. Binding to ${proteinData.name} may occur but is not the primary mechanism of action.`
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
