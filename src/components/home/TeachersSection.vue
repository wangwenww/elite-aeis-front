<template>
  <section class="py-24 bg-elite-ivory relative overflow-hidden">
    <div class="container mx-auto px-6">
      <div class="text-center mb-20">
        <h2 class="text-3xl md:text-4xl font-bold text-elite-ink mb-6">World-Class Faculty</h2>
        <p class="text-lg text-slate-600 font-light max-w-2xl mx-auto">
          Learn from the best. Our educators bring years of international teaching experience and passion to the classroom.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div 
          v-for="(teacher, index) in teachers" 
          :key="index"
          class="group relative overflow-hidden rounded-3xl bg-white shadow-soft-lg"
        >
          <div class="aspect-[3/4] overflow-hidden relative">
            <!-- Teacher Image -->
            <div class="w-full h-full bg-slate-200 transition-transform duration-700 group-hover:scale-110">
               <img :src="teacher.image" :alt="teacher.name" class="w-full h-full object-cover" />
            </div>
            
            <!-- Overlay -->
            <div class="absolute inset-0 bg-gradient-to-t from-elite-ink/90 via-elite-ink/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
            
            <!-- Content -->
            <div class="absolute bottom-0 left-0 w-full p-8 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              <h3 class="text-2xl font-bold text-white mb-1">{{ teacher.name }}</h3>
              <p class="text-elite-gold font-medium mb-4">{{ teacher.role }}</p>
              <p class="text-slate-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                {{ teacher.bio }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const teachers = [
  {
    name: 'Jane Lee',
    role: 'Senior English Lead',
    image: 'https://randomuser.me/api/portraits/women/63.jpg',
    bio: '10+ years of experience in international curriculum, specializing in academic writing and reading strategies.',
  },
  {
    name: 'Michael Koh',
    role: 'Mathematics Expert',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    bio: 'Specializes in Olympiad Math and AEIS preparation, helping students build systematic problem-solving skills.',
  },
  {
    name: 'Chen Wei',
    role: 'Primary Transition',
    image: 'https://randomuser.me/api/portraits/women/33.jpg',
    bio: 'Expert in bridging the gap between international and local systems for primary school students.',
  },
];
</script>
