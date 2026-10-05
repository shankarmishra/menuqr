

export default function HeroRestaurantVideo() {
  return (
    <div 
      className="absolute inset-0 w-full h-full z-0 overflow-hidden bg-[#FAFAF7]"
      style={{
        maskImage: 'linear-gradient(to right, transparent, black 15%, black 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 100%)'
      }}
    >
      <video
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster="/marketing/hero/hero-restaurant-poster.webp"
        preload="auto"
      >
        <source src="/marketing/hero/hero-restaurant.webm" type="video/webm" />
        <source src="/marketing/hero/hero-restaurant.mp4" type="video/mp4" />
      </video>
      {/* Soft depth blur to simulate camera bokeh */}
      <div className="absolute inset-0 backdrop-blur-[2px]" />
    </div>
  );
}


