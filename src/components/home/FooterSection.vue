<template>
  <footer class="bg-elite-black text-white py-16 border-t border-white/10">
    <div class="container mx-auto px-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div class="col-span-1 md:col-span-1">
          <div class="text-2xl font-bold tracking-tight mb-6">Elite Edu</div>
          <p class="text-slate-400 text-sm leading-relaxed">
            Empowering students with the knowledge and skills to succeed in a globalized world.
          </p>
        </div>
        
        <div>
          <h4 class="text-lg font-semibold mb-6">Programs</h4>
          <ul class="space-y-4 text-slate-400 text-sm">
            <li><a href="#" class="hover:text-elite-gold transition-colors">AEIS Preparation</a></li>
            <li><a href="#" class="hover:text-elite-gold transition-colors">Primary Transition</a></li>
            <li><a href="#" class="hover:text-elite-gold transition-colors">Academic Enhancement</a></li>
          </ul>
        </div>

        <div>
          <h4 class="text-lg font-semibold mb-6">Company</h4>
          <ul class="space-y-4 text-slate-400 text-sm">
            <li><a href="#" class="hover:text-elite-gold transition-colors">About Us</a></li>
            <li><a href="#" class="hover:text-elite-gold transition-colors">Our Team</a></li>
            <li><a href="#" class="hover:text-elite-gold transition-colors">Careers</a></li>
            <li><a href="#" class="hover:text-elite-gold transition-colors">Contact</a></li>
          </ul>
        </div>

        <div>
          <h4 class="text-lg font-semibold mb-6">Contact</h4>
          <ul class="space-y-4 text-slate-400 text-sm">
            <li class="flex items-start">
              <span class="mr-3 text-elite-gold">📍</span>
              Singapore · Central Area
            </li>
            <li class="flex items-center">
              <span class="mr-3 text-elite-gold">📧</span>
              contact@elite-edu.sg
            </li>
            <li class="flex items-center">
              <span class="mr-3 text-elite-gold">📞</span>
              +65-0000-0000
            </li>
          </ul>
        </div>
      </div>

      <div class="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
        <p>&copy; {{ new Date().getFullYear() }} Elite Education. All rights reserved.</p>
        <div class="flex gap-6 mt-4 md:mt-0">
          <a href="#" class="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" class="hover:text-white transition-colors">Terms of Service</a>
        </div>
      </div>
    </div>
  </footer>
</template>
