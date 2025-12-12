<template>
  <div class="font-sans antialiased text-slate-900 bg-white selection:bg-elite-gold/30">
    <HeroSection />
    <ProgramsSection />
    <AchievementsSection />
    <TestimonialsSection />
    <TeachersSection />
    <ContactSection />
    <FooterSection />
  </div>
</template>

<script setup>
import HeroSection from '../components/home/HeroSection.vue';
import ProgramsSection from '../components/home/ProgramsSection.vue';
import AchievementsSection from '../components/home/AchievementsSection.vue';
import TestimonialsSection from '../components/home/TestimonialsSection.vue';
import TeachersSection from '../components/home/TeachersSection.vue';
import ContactSection from '../components/home/ContactSection.vue';
import FooterSection from '../components/home/FooterSection.vue';
</script>

<style scoped>
/* Global styles for the home page if needed, though most should be in components or global CSS */
</style>

