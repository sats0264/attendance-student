import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full mt-auto py-8 md:py-12 
                       glass-panel rounded-t-3xl text-center
                       border-t border-white/5 premium-shadow relative overflow-hidden">
      <div className="flex flex-col items-center gap-4 justify-center max-w-7xl mx-auto z-10 relative">
        
        <h2 className="text-xl md:text-2xl font-bold text-gradient">
          AttendancePro
        </h2>
        
        <p className="text-sm md:text-base text-[var(--color-text-muted)] flex items-center justify-center gap-2">
          Propulsé par AWS Rekognition & React <Heart className="w-4 h-4 text-[var(--color-error)] animate-pulse" fill="var(--color-error)" />
        </p>
        
        <div className="mt-4 text-xs md:text-sm text-[var(--color-text-muted)] opacity-60">
          &copy; {new Date().getFullYear()} ESMT Dakar - Tous droits réservés.
        </div>
      </div>
      
      {/* Decorative background blurs inside footer */}
      <div className="absolute top-0 right-1/4 w-64 h-64 bg-[var(--color-primary)]/10 blur-[80px] rounded-full -z-10" />
      <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-[var(--color-accent)]/10 blur-[80px] rounded-full -z-10" />
    </footer>
  );
};

export default Footer;
