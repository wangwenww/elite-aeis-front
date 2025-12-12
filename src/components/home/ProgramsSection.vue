<template>
  <section id="courses" class="py-24 bg-white relative overflow-hidden">
    <div class="container mx-auto px-6">
      <div class="text-center max-w-3xl mx-auto mb-20">
        <h2 class="text-3xl md:text-4xl font-bold text-elite-ink mb-6">Core Curriculum</h2>
        <p class="text-lg text-slate-600 font-light">
          Tailored educational pathways designed for excellence. From AEIS preparation to specialized academic enhancement.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div 
          v-for="(program, index) in programs" 
          :key="index"
          class="group relative h-[400px] perspective-1000"
        >
          <div class="relative h-full w-full transition-all duration-500 transform-style-3d group-hover:rotate-y-12">
            <!-- Card Content -->
            <div class="absolute inset-0 bg-white rounded-3xl p-8 shadow-soft-xl border border-slate-100 flex flex-col justify-between transition-all duration-300 group-hover:shadow-2xl group-hover:border-elite-gold/30">
              <div>
                <div class="w-14 h-14 rounded-2xl bg-elite-grey flex items-center justify-center mb-8 text-2xl text-elite-gold">
                  <component :is="program.icon" />
                </div>
                <h3 class="text-2xl font-bold text-elite-ink mb-4">{{ program.title }}</h3>
                <p class="text-slate-600 leading-relaxed">{{ program.description }}</p>
              </div>
              
              <div class="flex items-center text-elite-gold font-medium group/link cursor-pointer">
                <span>Learn more</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2 transform transition-transform group-hover/link:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { AimOutlined, BookOutlined, RocketOutlined } from '@ant-design/icons-vue';

const programs = [
  {
    title: 'AEIS Preparation',
    description: 'Comprehensive preparation for international students seeking admission to Singapore government schools.',
    icon: AimOutlined,
  },
  {
    title: 'Primary Transition',
    description: 'Bridging programs to help students adapt to the local curriculum and classroom culture seamlessly.',
    icon: BookOutlined,
  },
  {
    title: 'Academic Excellence',
    description: 'Targeted enhancement in Math and English to build a strong foundation for future success.',
    icon: RocketOutlined,
  },
];
</script>

<style scoped>
.perspective-1000 {
  perspective: 1000px;
}

.transform-style-3d {
  transform-style: preserve-3d;
}

.rotate-y-12 {
  transform: rotateY(5deg) translateY(-10px);
}
</style>
