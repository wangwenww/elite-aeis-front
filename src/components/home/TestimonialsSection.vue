<template>
  <section class="py-24 bg-white relative overflow-hidden">
    <div class="container mx-auto px-6">
      <div class="text-center mb-20">
        <h2 class="text-3xl md:text-4xl font-bold text-elite-ink mb-6">Success Stories</h2>
        <p class="text-lg text-slate-600 font-light">
          Hear from our students and parents about their journey with Elite Edu.
        </p>
      </div>

      <div class="relative max-w-4xl mx-auto">
        <!-- Grid-based Carousel for Auto Height -->
        <transition-group 
          name="fade" 
          tag="div" 
          class="grid grid-cols-1 relative min-h-[300px]"
        >
          <div 
            v-for="(testimonial, index) in testimonials" 
              :key="index"
              v-show="currentSlide === index"
              class="col-start-1 row-start-1 flex flex-col items-center justify-center text-center px-4 transition-all duration-500"
            >
              <div class="w-20 h-20 rounded-full bg-elite-grey mb-8 overflow-hidden border-2 border-elite-gold/20 shadow-sm">
                 <img :src="testimonial.avatar" :alt="testimonial.name" class="w-full h-full object-cover" />
              </div>
              <p class="text-xl md:text-2xl text-slate-700 font-light italic mb-8 leading-relaxed">
                "{{ testimonial.quote }}"
              </p>
              <div>
                <h4 class="text-lg font-bold text-elite-ink">{{ testimonial.name }}</h4>
                <p class="text-elite-gold text-sm uppercase tracking-wider">{{ testimonial.role }}</p>
              </div>
          </div>
        </transition-group>

        <!-- Controls -->
        <div class="flex justify-center gap-4 mt-12">
          <button 
            v-for="(_, index) in testimonials" 
            :key="index"
            @click="currentSlide = index"
            class="w-3 h-3 rounded-full transition-all duration-300"
            :class="currentSlide === index ? 'bg-elite-gold w-8' : 'bg-slate-200 hover:bg-slate-300'"
          ></button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const currentSlide = ref(0);
const testimonials = [
  {
    name: 'Dennis',
    role: 'AEIS Student',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    quote: 'The structured approach and personalized attention helped me improve my English significantly in just 3 months. I successfully passed the AEIS exam!',
  },
  {
    name: 'Mrs. Tan',
    role: 'Parent',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    quote: 'Elite Edu provides a very supportive environment. The teachers are professional and truly care about the students\' progress. Highly recommended.',
  },
  {
    name: 'Alice',
    role: 'Primary Student',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    quote: 'I love the classes here! Learning Math has become so much fun, and I feel much more confident in school now.',
  },
];

let interval;

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % testimonials.length;
};

onMounted(() => {
  interval = setInterval(nextSlide, 5000);
});

onUnmounted(() => {
  clearInterval(interval);
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
