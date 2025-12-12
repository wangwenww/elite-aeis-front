<template>
  <section class="py-24 bg-elite-ink text-white relative overflow-hidden">
    <!-- Background Pattern -->
    <div class="absolute inset-0 opacity-10">
      <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
    </div>

    <div class="container mx-auto px-6 relative z-10">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-center">
        <div v-for="(stat, index) in stats" :key="index" class="stat-item">
          <div class="text-5xl md:text-6xl font-bold text-elite-gold mb-4 font-mono">
            {{ stat.currentValue }}{{ stat.suffix }}
          </div>
          <div class="text-lg text-slate-400 font-light tracking-wide uppercase">{{ stat.label }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const stats = ref([
  { label: 'Success Rate', value: 95, currentValue: 0, suffix: '%' },
  { label: 'Students Placed', value: 500, currentValue: 0, suffix: '+' },
  { label: 'Expert Teachers', value: 15, currentValue: 0, suffix: '+' },
  { label: 'Years Experience', value: 10, currentValue: 0, suffix: '+' },
]);

const animateValue = (obj, start, end, duration) => {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    obj.currentValue = Math.floor(progress * (end - start) + start);
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
};

onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        stats.value.forEach((stat) => {
          animateValue(stat, 0, stat.value, 2000);
        });
        observer.disconnect();
      }
    });
  }, { threshold: 0.5 });

  const section = document.querySelector('.stat-item');
  if (section) {
    observer.observe(section.parentElement); // Observe the container
  }
});
</script>
