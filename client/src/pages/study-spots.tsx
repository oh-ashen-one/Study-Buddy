import { useState, useEffect } from 'react';
import { Coffee, BookOpen, Trees, Building2, Wifi, Zap, VolumeX, Pizza, Moon, MapPin, Navigation, Star, X, Plus, Footprints } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type SpotType = 'cafe' | 'library' | 'outdoor' | 'campus';
type AmenityType = 'wifi' | 'outlets' | 'quiet' | 'food' | 'late';

interface StudySpot {
  id: number;
  name: string;
  type: SpotType;
  lat: number;
  lng: number;
  rating: number;
  amenities: string[];
  open: boolean;
  hours: string;
  reviews: number;
  description: string;
}

const studySpots: StudySpot[] = [
  { id: 1, name: "The Quiet Corner", type: "library", lat: 35, lng: 42, rating: 4.8, amenities: ["wifi", "outlets", "quiet"], open: true, hours: "Until 11pm", reviews: 23, description: "Hidden gem on the 3rd floor, perfect for deep focus" },
  { id: 2, name: "Midnight Brew", type: "cafe", lat: 58, lng: 28, rating: 4.5, amenities: ["wifi", "food", "late"], open: true, hours: "Until 2am", reviews: 67, description: "Best espresso near campus, cozy vibes" },
  { id: 3, name: "Scholar's Grove", type: "outdoor", lat: 25, lng: 65, rating: 4.2, amenities: ["quiet", "outlets"], open: true, hours: "Always open", reviews: 12, description: "Shaded benches with outlets hidden in the rocks" },
  { id: 4, name: "The Archives", type: "library", lat: 70, lng: 55, rating: 4.9, amenities: ["wifi", "outlets", "quiet"], open: false, hours: "Opens 8am", reviews: 89, description: "Old library wing, smells like wisdom" },
  { id: 5, name: "Bean There", type: "cafe", lat: 45, lng: 75, rating: 4.3, amenities: ["wifi", "food", "outlets"], open: true, hours: "Until 10pm", reviews: 34, description: "Friendly baristas, great study playlist" },
  { id: 6, name: "Rooftop Retreat", type: "campus", lat: 82, lng: 38, rating: 4.7, amenities: ["quiet", "wifi"], open: true, hours: "Until 9pm", reviews: 45, description: "Secret rooftop access, incredible sunset views" },
];

const TypeIcon = ({ type, className }: { type: SpotType; className?: string }) => {
  const icons = {
    cafe: Coffee,
    library: BookOpen,
    outdoor: Trees,
    campus: Building2
  };
  const Icon = icons[type];
  return <Icon className={className} />;
};

const AmenityIcon = ({ amenity, className }: { amenity: AmenityType; className?: string }) => {
  const icons = {
    wifi: Wifi,
    outlets: Zap,
    quiet: VolumeX,
    food: Pizza,
    late: Moon
  };
  const Icon = icons[amenity];
  return Icon ? <Icon className={className} /> : null;
};

const amenityLabels: Record<AmenityType, string> = {
  wifi: "WiFi",
  outlets: "Outlets",
  quiet: "Quiet",
  food: "Food",
  late: "Open Late"
};

export default function StudySpots() {
  const [selectedSpot, setSelectedSpot] = useState<StudySpot | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [filters, setFilters] = useState<string[]>([]);
  const [userPosition] = useState({ x: 50, y: 50 });
  const [footstepFrame, setFootstepFrame] = useState(0);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 500);
    const interval = setInterval(() => {
      setFootstepFrame(f => (f + 1) % 4);
    }, 600);
    return () => clearInterval(interval);
  }, []);

  const toggleFilter = (filter: string) => {
    setFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const filteredSpots = studySpots.filter(spot => {
    if (filters.length === 0) return true;
    if (filters.includes('open') && !spot.open) return false;
    return filters.every(f => f === 'open' || spot.amenities.includes(f));
  });

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`w-3.5 h-3.5 ${i < fullStars ? 'fill-amber-400 text-amber-400' : 'text-amber-400/30'}`} 
        />
      );
    }
    return stars;
  };

  return (
    <div 
      className="w-full h-screen overflow-hidden relative"
      style={{
        background: `
          radial-gradient(ellipse at 20% 80%, rgba(139, 90, 43, 0.15) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 20%, rgba(101, 67, 33, 0.1) 0%, transparent 50%),
          linear-gradient(180deg, #2a1f14 0%, #1a1410 50%, #0f0c09 100%)
        `,
        fontFamily: "'Crimson Text', 'Times New Roman', serif",
      }}
      data-testid="study-spots-page"
    >
      
      {/* Parchment texture overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          opacity: 0.03,
        }} 
      />

      {/* Header */}
      <div 
        className="absolute top-0 left-0 right-0 p-5 text-center z-10"
        style={{
          background: 'linear-gradient(180deg, rgba(15,12,9,0.95) 0%, transparent 100%)'
        }}
      >
        <h1 
          className="text-[28px] font-normal italic m-0 transition-all duration-[1500ms] ease-out"
          style={{
            color: '#c9a227',
            textShadow: '0 0 30px rgba(201, 162, 39, 0.5), 0 0 60px rgba(201, 162, 39, 0.3)',
            letterSpacing: '3px',
            opacity: loaded ? 1 : 0,
            transform: loaded ? 'translateY(0)' : 'translateY(-20px)',
          }}
        >
          I solemnly swear I need to study
        </h1>
        <p 
          className="text-xs uppercase mt-2 transition-opacity duration-[2000ms] ease-out"
          style={{
            color: 'rgba(201, 162, 39, 0.5)',
            letterSpacing: '6px',
            opacity: loaded ? 1 : 0,
            transitionDelay: '0.5s'
          }}
        >
          Study Buddy Map
        </p>
      </div>

      {/* Filter Bar */}
      <div 
        className="absolute top-[90px] left-1/2 -translate-x-1/2 flex gap-2.5 z-10 transition-opacity duration-1000 ease-out"
        style={{
          opacity: loaded ? 1 : 0,
          transitionDelay: '1s'
        }}
      >
        {(['open', 'wifi', 'quiet', 'outlets', 'food'] as const).map(filter => (
          <Button
            key={filter}
            variant="outline"
            size="sm"
            onClick={() => toggleFilter(filter)}
            className={`flex items-center gap-1.5 rounded-full text-[11px] uppercase tracking-wider transition-all duration-300 toggle-elevate ${
              filters.includes(filter) 
                ? 'toggle-elevated bg-primary/30 border-primary text-primary shadow-[0_0_15px_rgba(201,162,39,0.3)]' 
                : 'bg-[#2a1f14]/80 border-primary/30 text-primary/70'
            }`}
            data-testid={`filter-${filter}`}
          >
            {filter === 'open' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Open
              </>
            ) : (
              <>
                <AmenityIcon amenity={filter} className="w-3 h-3" />
                {filter}
              </>
            )}
          </Button>
        ))}
      </div>

      {/* Map Area */}
      <div 
        className="absolute top-[140px] left-5 right-5 bottom-5 rounded-lg overflow-hidden transition-opacity duration-[1500ms] ease-out"
        style={{
          background: `
            radial-gradient(ellipse at center, rgba(62, 47, 32, 0.5) 0%, rgba(26, 20, 16, 0.8) 100%),
            linear-gradient(rgba(139, 90, 43, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 90, 43, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 50px 50px, 50px 50px',
          border: '3px solid rgba(139, 90, 43, 0.4)',
          boxShadow: 'inset 0 0 100px rgba(0,0,0,0.5), 0 0 30px rgba(0,0,0,0.5)',
          opacity: loaded ? 1 : 0,
          transitionDelay: '0.3s'
        }}
        data-testid="map-area"
      >
        
        {/* Decorative compass */}
        <div className="absolute bottom-5 right-5 w-[60px] h-[60px] opacity-40">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#8b5a2b" strokeWidth="1"/>
            <circle cx="50" cy="50" r="35" fill="none" stroke="#8b5a2b" strokeWidth="0.5"/>
            <text x="50" y="15" textAnchor="middle" fill="#c9a227" fontSize="12" fontFamily="serif">N</text>
            <text x="50" y="95" textAnchor="middle" fill="#8b5a2b" fontSize="10" fontFamily="serif">S</text>
            <text x="10" y="54" textAnchor="middle" fill="#8b5a2b" fontSize="10" fontFamily="serif">W</text>
            <text x="90" y="54" textAnchor="middle" fill="#8b5a2b" fontSize="10" fontFamily="serif">E</text>
            <polygon points="50,20 45,50 50,45 55,50" fill="#c9a227"/>
            <polygon points="50,80 45,50 50,55 55,50" fill="#8b5a2b"/>
          </svg>
        </div>

        {/* Ink path decorations */}
        <svg className="absolute inset-0 w-full h-full opacity-30">
          <path d="M 0,30% Q 25%,25% 50%,35% T 100%,30%" stroke="#8b5a2b" strokeWidth="1" fill="none" strokeDasharray="5,5"/>
          <path d="M 10%,60% Q 40%,70% 60%,55% T 90%,65%" stroke="#8b5a2b" strokeWidth="1" fill="none" strokeDasharray="3,7"/>
          <path d="M 20%,10% L 20%,90%" stroke="rgba(139,90,43,0.2)" strokeWidth="0.5"/>
          <path d="M 50%,5% L 50%,95%" stroke="rgba(139,90,43,0.2)" strokeWidth="0.5"/>
          <path d="M 80%,10% L 80%,90%" stroke="rgba(139,90,43,0.2)" strokeWidth="0.5"/>
        </svg>

        {/* User position with footsteps */}
        <div 
          className="absolute z-[5]"
          style={{
            left: `${userPosition.x}%`,
            top: `${userPosition.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div 
            className="animate-pulse"
            style={{
              textShadow: '0 0 10px rgba(201, 162, 39, 0.8)'
            }}
          >
            <Footprints className="w-5 h-5 text-[#c9a227]" />
          </div>
          <div 
            className="absolute top-full left-1/2 -translate-x-1/2 text-[9px] italic whitespace-nowrap opacity-70"
            style={{ color: '#c9a227' }}
          >
            You are here
          </div>
        </div>

        {/* Study Spots */}
        {filteredSpots.map((spot, index) => (
          <div
            key={spot.id}
            onClick={() => setSelectedSpot(spot)}
            className="absolute cursor-pointer transition-transform duration-200 ease-out"
            style={{
              left: `${spot.lng}%`,
              top: `${spot.lat}%`,
              transform: 'translate(-50%, -50%)',
              opacity: loaded ? (spot.open ? 1 : 0.4) : 0,
              transition: `opacity 0.5s ease-out ${0.5 + index * 0.1}s, transform 0.2s ease`,
              zIndex: selectedSpot?.id === spot.id ? 10 : 1
            }}
            data-testid={`spot-marker-${spot.id}`}
          >
            {/* Glow effect */}
            <div 
              className="absolute -inset-[15px]"
              style={{
                background: spot.open 
                  ? 'radial-gradient(circle, rgba(201, 162, 39, 0.4) 0%, transparent 70%)'
                  : 'none',
                animation: spot.open ? `glow 3s ease-in-out infinite ${index * 0.3}s` : 'none',
              }} 
            />
            
            {/* Pin */}
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
              style={{
                background: `radial-gradient(circle at 30% 30%, rgba(201, 162, 39, 0.9), rgba(139, 90, 43, 0.8))`,
                border: '2px solid #c9a227',
                boxShadow: spot.open 
                  ? '0 0 20px rgba(201, 162, 39, 0.5), inset 0 0 10px rgba(0,0,0,0.3)'
                  : 'inset 0 0 10px rgba(0,0,0,0.5)',
              }}
            >
              <TypeIcon type={spot.type} className="w-5 h-5 text-[#1a1410]" />
            </div>
            
            {/* Label */}
            <div 
              className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 whitespace-nowrap text-[11px] italic opacity-90"
              style={{
                color: '#c9a227',
                textShadow: '0 0 10px rgba(0,0,0,0.8)',
              }}
            >
              {spot.name}
            </div>

            {/* Hot spot footsteps */}
            {spot.reviews > 50 && spot.open && (
              <div 
                className="absolute text-[10px] opacity-50 transition-all duration-300"
                style={{
                  left: footstepFrame % 2 === 0 ? '-20px' : '45px',
                  top: footstepFrame < 2 ? '-5px' : '30px',
                }}
              >
                <Footprints className="w-3 h-3 text-[#c9a227]" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Spot Detail Card */}
      {selectedSpot && (
        <div 
          className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[min(400px,calc(100%-60px))] p-5 rounded-xl z-20"
          style={{
            background: `linear-gradient(145deg, rgba(62, 47, 32, 0.95), rgba(42, 31, 20, 0.98))`,
            border: '2px solid rgba(201, 162, 39, 0.5)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(201, 162, 39, 0.2)',
            animation: 'slideUp 0.4s ease-out'
          }}
          data-testid="spot-detail-card"
        >
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedSpot(null)}
            className="absolute top-2.5 right-2.5 h-8 w-8 text-primary/60"
            data-testid="close-spot-detail"
          >
            <X className="w-5 h-5" />
          </Button>

          {/* Spot header */}
          <div className="flex items-center gap-3 mb-3">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: `radial-gradient(circle at 30% 30%, rgba(201, 162, 39, 0.9), rgba(139, 90, 43, 0.8))`,
              }}
            >
              <TypeIcon type={selectedSpot.type} className="w-6 h-6 text-[#1a1410]" />
            </div>
            <div>
              <h3 
                className="m-0 text-xl font-normal italic"
                style={{ color: '#c9a227' }}
              >
                {selectedSpot.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex">
                  {renderStars(selectedSpot.rating)}
                </div>
                <span className="text-xs" style={{ color: 'rgba(201, 162, 39, 0.6)' }}>
                  {selectedSpot.rating} · {selectedSpot.reviews} reviews
                </span>
              </div>
            </div>
          </div>

          {/* Status */}
          <div 
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-medium mb-3"
            style={{
              background: selectedSpot.open ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
              color: selectedSpot.open ? '#81c784' : '#e57373',
            }}
          >
            <span 
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: selectedSpot.open ? '#81c784' : '#e57373' }}
            />
            {selectedSpot.open ? 'Open' : 'Closed'} · {selectedSpot.hours}
          </div>

          {/* Description */}
          <p 
            className="text-[13px] italic m-0 mb-4 leading-relaxed"
            style={{ color: 'rgba(201, 162, 39, 0.8)' }}
          >
            "{selectedSpot.description}"
          </p>

          {/* Amenities */}
          <div className="flex gap-2.5 flex-wrap mb-4">
            {selectedSpot.amenities.map(amenity => (
              <Badge 
                key={amenity} 
                variant="secondary"
                className="flex items-center gap-1.5 bg-primary/15 text-primary/90 no-default-active-elevate"
              >
                <AmenityIcon amenity={amenity as AmenityType} className="w-3 h-3" />
                {amenityLabels[amenity as AmenityType]}
              </Badge>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2.5">
            <Button 
              className="flex-1 bg-primary text-primary-foreground"
              data-testid="get-directions-btn"
            >
              <Navigation className="w-4 h-4" />
              Get Directions
            </Button>
            <Button 
              variant="outline"
              className="flex-1 border-primary/50 text-primary"
              data-testid="add-review-btn"
            >
              <Star className="w-4 h-4" />
              Add Review
            </Button>
          </div>
        </div>
      )}

      {/* Add Spot Button (Wax Seal style) */}
      <Button
        size="icon"
        className="absolute bottom-8 right-8 w-14 h-14 rounded-full z-[15] transition-all duration-200 bg-gradient-to-br from-[#8b2500] to-[#5c1a00] border-[3px] border-[#a52a2a] text-amber-400 shadow-[0_4px_15px_rgba(0,0,0,0.4),inset_0_-2px_5px_rgba(0,0,0,0.3)]"
        style={{
          opacity: loaded ? 1 : 0,
          transition: 'opacity 1s ease-out 1.5s, transform 0.2s ease',
          display: selectedSpot ? 'none' : 'flex',
        }}
        data-testid="add-spot-btn"
      >
        <Plus className="w-6 h-6" />
      </Button>

      {/* CSS Animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap');
        
        @keyframes glow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.2); }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
}
