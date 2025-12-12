<template>
  <section class="relative min-h-screen flex items-center justify-center overflow-hidden bg-elite-grey">
    <!-- Background Elements -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-blue-100/40 to-purple-100/40 blur-3xl animate-blob"></div>
      <div class="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-elite-gold/10 to-orange-100/20 blur-3xl animate-blob animation-delay-2000"></div>
      <div class="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-blue-50/50 to-elite-ivory blur-3xl animate-blob animation-delay-4000"></div>
      
      <!-- Glass Overlay -->
      <div class="absolute inset-0 bg-white/30 backdrop-blur-[1px]"></div>
    </div>

    <!-- Content -->
    <div class="relative z-10 container mx-auto px-6 text-center">
      <h1 
        class="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-elite-ink mb-8 opacity-0 translate-y-8 animate-fade-in-up"
        style="animation-delay: 0.2s; animation-fill-mode: forwards;"
      >
        <span class="block bg-clip-text text-transparent bg-gradient-to-r from-elite-ink to-slate-600">
          Elite Education
        </span>
        <span class="block text-3xl md:text-5xl lg:text-6xl mt-4 font-light text-slate-600">
          Singapore
        </span>
      </h1>

      <p 
        class="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-12 font-light leading-relaxed opacity-0 translate-y-8 animate-fade-in-up"
        style="animation-delay: 0.4s; animation-fill-mode: forwards;"
      >
        Cultivating excellence through premium education. 
        <br class="hidden md:block" />
        Your gateway to world-class academic success.
      </p>

      <div 
        class="flex flex-col md:flex-row items-center justify-center gap-6 opacity-0 translate-y-8 animate-fade-in-up"
        style="animation-delay: 0.6s; animation-fill-mode: forwards;"
      >
        <button 
          class="group relative px-8 py-4 bg-elite-ink text-white rounded-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-elite-ink/20 hover:-translate-y-1"
        >
          <span class="relative z-10 font-medium tracking-wide">Explore Programs</span>
          <div class="absolute inset-0 bg-gradient-to-r from-slate-800 to-black opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
        
        <button 
          class="group px-8 py-4 bg-white text-elite-ink border border-slate-200 rounded-full transition-all duration-300 hover:border-elite-ink/30 hover:bg-slate-50"
        >
          <span class="font-medium tracking-wide">Contact Us</span>
        </button>
      </div>
    </div>

    <!-- Scroll Indicator -->
    <div class="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-elite-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    </div>
  </section>
</template>

<script setup>
// No extra logic needed for basic CSS animations
</script>

<style scoped>
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(2rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
