import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const CollageHero = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Collage images with different positions and styles
  const collageImages = [
    {
      src: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=400&fit=crop",
      alt: "Community volunteers",
      className: "absolute top-0 left-0 w-48 h-48 rounded-2xl rotate-[-5deg] z-10",
      colorOverlay: "bg-gradient-to-br from-[#75CAC3]/70 to-[#2A6171]/70",
      delay: "delay-100"
    },
    {
      src: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400&h=400&fit=crop",
      alt: "Team collaboration",
      className: "absolute top-20 left-32 w-40 h-40 rounded-xl rotate-[8deg] z-20",
      colorOverlay: "bg-gradient-to-br from-[#F3D516]/60 to-[#75CAC3]/60",
      delay: "delay-200"
    },
    {
      src: "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=400&h=400&fit=crop",
      alt: "Community garden",
      className: "absolute top-0 right-20 w-56 h-56 rounded-3xl rotate-[3deg] z-10",
      colorOverlay: "bg-gradient-to-br from-[#19D3DA]/60 to-[#2A6171]/70",
      delay: "delay-300"
    },
    {
      src: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=400&h=400&fit=crop",
      alt: "Volunteers helping",
      className: "absolute bottom-10 left-10 w-44 h-44 rounded-2xl rotate-[-8deg] z-30",
      colorOverlay: "bg-gradient-to-br from-[#2A6171]/70 to-[#D7F7F5]/40",
      delay: "delay-400"
    },
    {
      src: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop",
      alt: "Creative workshop",
      className: "absolute bottom-0 right-0 w-52 h-52 rounded-xl rotate-[5deg] z-20",
      colorOverlay: "bg-gradient-to-br from-[#F3D516]/50 to-[#19D3DA]/60",
      delay: "delay-500"
    },
    {
      src: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&h=400&fit=crop",
      alt: "Teaching kids",
      className: "absolute top-40 right-48 w-36 h-36 rounded-lg rotate-[-12deg] z-30",
      colorOverlay: "bg-gradient-to-br from-[#D7F7F5]/50 to-[#75CAC3]/60",
      delay: "delay-600"
    },
    {
      src: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=400&h=400&fit=crop",
      alt: "Food donation",
      className: "absolute bottom-20 right-40 w-40 h-40 rounded-2xl rotate-[15deg] z-10",
      colorOverlay: "bg-gradient-to-br from-[#75CAC3]/70 to-[#F3D516]/50",
      delay: "delay-700"
    },
    {
      src: "https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?w=400&h=400&fit=crop",
      alt: "Beach cleanup",
      className: "absolute top-10 left-60 w-32 h-32 rounded-lg rotate-[10deg] z-15",
      colorOverlay: "bg-gradient-to-br from-[#2A6171]/80 to-[#75CAC3]/50",
      delay: "delay-150"
    },
    {
      src: "https://images.unsplash.com/photo-1545056453-f0359c3df6db?w=400&h=400&fit=crop",
      alt: "Youth mentoring",
      className: "absolute top-32 right-10 w-38 h-38 rounded-2xl rotate-[-7deg] z-25",
      colorOverlay: "bg-gradient-to-br from-[#F3D516]/70 to-[#D7F7F5]/40",
      delay: "delay-250"
    },
    {
      src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
      alt: "Reading program",
      className: "absolute bottom-32 left-48 w-36 h-36 rounded-xl rotate-[12deg] z-15",
      colorOverlay: "bg-gradient-to-br from-[#19D3DA]/60 to-[#2A6171]/70",
      delay: "delay-350"
    },
    {
      src: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&h=400&fit=crop",
      alt: "Family volunteering",
      className: "absolute top-24 left-1/2 w-42 h-42 rounded-3xl rotate-[-15deg] z-18",
      colorOverlay: "bg-gradient-to-br from-[#75CAC3]/60 to-[#F3D516]/40",
      delay: "delay-450"
    },
    {
      src: "https://images.unsplash.com/photo-1517486808906-6ca8b3d66f4f?w=400&h=400&fit=crop",
      alt: "Sports coaching",
      className: "absolute bottom-16 right-24 w-28 h-28 rounded-lg rotate-[18deg] z-22",
      colorOverlay: "bg-gradient-to-br from-[#2A6171]/60 to-[#D7F7F5]/50",
      delay: "delay-550"
    },
    {
      src: "https://images.unsplash.com/photo-1547496502-affa22d38842?w=400&h=400&fit=crop",
      alt: "Art therapy",
      className: "absolute top-48 left-20 w-34 h-34 rounded-2xl rotate-[-20deg] z-12",
      colorOverlay: "bg-gradient-to-br from-[#F3D516]/40 to-[#75CAC3]/70",
      delay: "delay-650"
    },
    {
      src: "https://images.unsplash.com/photo-1578496479914-7ef3b0193be3?w=400&h=400&fit=crop",
      alt: "Senior care",
      className: "absolute bottom-8 left-1/3 w-30 h-30 rounded-xl rotate-[25deg] z-28",
      colorOverlay: "bg-gradient-to-br from-[#2A6171]/60 to-[#19D3DA]/50",
      delay: "delay-750"
    }
  ];

  return (
    <section className="relative overflow-hidden">
      {/* Dual Color Hunt palette gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#373A40] via-[#2A6171] to-[#373A40]">
        {/* Additional color splashes - mixing both palettes */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#75CAC3]/40 rounded-full blur-3xl" />
        <div className="absolute top-20 right-0 w-80 h-80 bg-[#F3D516]/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-[#19D3DA]/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-[#D7F7F5]/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-[40rem] h-[40rem] bg-gradient-to-br from-[#75CAC3]/40 to-[#2A6171]/40 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-[#F3D516]/20 rounded-full blur-3xl" />
      </div>

      {/* SVG Shapes Layer */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gear shape */}
        <svg className="absolute top-16 left-40 w-24 h-24 text-[#F3D516] rotate-45" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5a3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97c0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1c0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66Z"/>
        </svg>

        {/* Triangle */}
        <svg className="absolute bottom-24 left-20 w-32 h-32 text-[#75CAC3] opacity-80" viewBox="0 0 100 100">
          <polygon points="50,10 90,90 10,90" fill="currentColor" />
        </svg>

        {/* Circle dots pattern */}
        <svg className="absolute top-32 right-32 w-20 h-20 text-[#2A6171] opacity-90" viewBox="0 0 100 100">
          <circle cx="20" cy="20" r="5" fill="currentColor" />
          <circle cx="50" cy="20" r="5" fill="currentColor" />
          <circle cx="80" cy="20" r="5" fill="currentColor" />
          <circle cx="20" cy="50" r="5" fill="currentColor" />
          <circle cx="50" cy="50" r="5" fill="currentColor" />
          <circle cx="80" cy="50" r="5" fill="currentColor" />
          <circle cx="20" cy="80" r="5" fill="currentColor" />
          <circle cx="50" cy="80" r="5" fill="currentColor" />
          <circle cx="80" cy="80" r="5" fill="currentColor" />
        </svg>

        {/* Abstract blob */}
        <svg className="absolute bottom-16 right-16 w-40 h-40 text-[#D7F7F5] opacity-50" viewBox="0 0 200 200">
          <path d="M40,100 Q60,40 100,50 T160,100 Q140,160 100,150 T40,100" fill="currentColor" />
        </svg>

        {/* People icons */}
        <svg className="absolute top-60 left-16 w-28 h-28 text-[#2A6171] opacity-90" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
        </svg>

        {/* Megaphone */}
        <svg className="absolute bottom-40 right-60 w-24 h-24 text-[#F3D516] opacity-80 -rotate-12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 7v7c0 1.1.9 2 2 2h1l2 2v-2h5c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2H10c-1.1 0-2 .9-2 2zm-4 1c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1s1-.45 1-1V9c0-.55-.45-1-1-1zm17.5 1.5c0 2.76-1.12 5.26-2.93 7.07l1.06 1.06c2.09-2.09 3.37-4.98 3.37-8.13s-1.28-6.04-3.37-8.13l-1.06 1.06c1.81 1.81 2.93 4.31 2.93 7.07z"/>
        </svg>

        {/* Star shape */}
        <svg className="absolute top-12 right-64 w-20 h-20 text-[#75CAC3] rotate-12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>

        {/* Building blocks */}
        <svg className="absolute top-48 right-12 w-32 h-32 text-[#F3D516] opacity-60 rotate-45" viewBox="0 0 100 100">
          <rect x="10" y="10" width="30" height="30" fill="currentColor" />
          <rect x="50" y="10" width="30" height="30" fill="currentColor" opacity="0.7" />
          <rect x="10" y="50" width="30" height="30" fill="currentColor" opacity="0.7" />
          <rect x="50" y="50" width="30" height="30" fill="currentColor" opacity="0.5" />
        </svg>

        {/* Hearts */}
        <svg className="absolute bottom-8 left-64 w-16 h-16 text-[#2A6171]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>

        {/* Wave line */}
        <svg className="absolute top-80 left-1/2 w-48 h-24 text-[#75CAC3] opacity-60" viewBox="0 0 200 100">
          <path d="M0,50 Q50,10 100,50 T200,50" stroke="currentColor" strokeWidth="3" fill="none" />
        </svg>
      </div>

      {/* Collage Background */}
      <div className="absolute inset-0">
        <div className="relative h-full max-w-7xl mx-auto">
          {collageImages.map((image, index) => (
            <div
              key={index}
              className={`${image.className} transition-all duration-1000 ease-out ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              } ${image.delay}`}
            >
              {/* Colored background shape */}
              <div className={`absolute inset-0 ${image.colorOverlay} rounded-inherit transform scale-110 -z-10`} />
              
              <img 
                src={image.src} 
                alt={image.alt}
                className="w-full h-full object-cover shadow-xl rounded-inherit"
              />
              {/* Enhanced color overlay */}
              <div className={`absolute inset-0 ${image.colorOverlay} mix-blend-overlay rounded-inherit`} />
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-40 container mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-40">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="space-y-4 bg-[#2A6171]/95 backdrop-blur-md rounded-3xl p-8 lg:p-12 shadow-2xl border border-[#75CAC3]/30">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="text-[#F3D516]">Mobilize</span>
              <span className="text-[#D7F7F5]"> Your</span>
              <span className="text-[#75CAC3] block mt-2">Purpose</span>
            </h1>
            <p className="text-xl text-[#D7F7F5]/90 leading-relaxed max-w-2xl mx-auto">
              Connect with meaningful opportunities that match your unique skills. 
              Build stronger communities through purposeful action, one mission at a time.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button 
                size="xl" 
                onClick={() => navigate('/register')}
                className="bg-[#F3D516] hover:bg-[#F3D516]/90 text-[#2A6171] font-bold border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
              >
                Find Your Mission
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="xl"
                onClick={() => navigate('/register')}
                className="border-2 border-[#75CAC3] hover:bg-[#75CAC3] hover:text-[#2A6171] bg-transparent text-[#D7F7F5] backdrop-blur-sm transition-all"
              >
                For Organizations
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Additional decorative elements */}
      <div className="absolute top-1/3 left-20 w-20 h-20 bg-[#F3D516] rounded-full opacity-70 animate-pulse" />
      <div className="absolute bottom-1/3 right-32 w-16 h-16 bg-[#75CAC3] rounded-full opacity-80 animate-pulse delay-300" />
      <div className="absolute top-2/3 right-20 w-24 h-24 bg-[#19D3DA] rounded-full opacity-60 animate-pulse delay-500" />
      <div className="absolute bottom-1/4 left-1/3 w-32 h-32 bg-[#D7F7F5] rounded-full opacity-40 animate-pulse delay-700" />
      <div className="absolute top-1/4 right-1/3 w-28 h-28 bg-[#2A6171] rounded-full opacity-70 animate-pulse delay-900" />
    </section>
  );
};

export default CollageHero;