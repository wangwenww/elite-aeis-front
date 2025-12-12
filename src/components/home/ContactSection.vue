<template>
  <section id="contact" class="py-24 bg-elite-grey relative overflow-hidden">
    <div class="container mx-auto px-6">
      <div class="max-w-5xl mx-auto bg-white rounded-3xl shadow-soft-xl overflow-hidden flex flex-col md:flex-row">
        <!-- Contact Info -->
        <div class="md:w-2/5 bg-elite-ink text-white p-12 flex flex-col justify-between relative overflow-hidden">
          <div class="absolute top-0 right-0 w-64 h-64 bg-elite-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div>
            <h3 class="text-2xl font-bold mb-6">Get in Touch</h3>
            <p class="text-slate-300 mb-12 leading-relaxed">
              Ready to start your journey? Contact us for a consultation or to schedule a visit.
            </p>
            
            <div class="space-y-6">
              <div class="flex items-start">
                <span class="text-elite-gold mr-4 text-xl">📍</span>
                <p class="text-slate-300 text-sm">Singapore · Central Area</p>
              </div>
              <div class="flex items-center">
                <span class="text-elite-gold mr-4 text-xl">📧</span>
                <p class="text-slate-300 text-sm">contact@elite-edu.sg</p>
              </div>
              <div class="flex items-center">
                <span class="text-elite-gold mr-4 text-xl">📞</span>
                <p class="text-slate-300 text-sm">+65-0000-0000</p>
              </div>
            </div>
          </div>

          <div class="mt-12">
             <!-- Social Icons could go here -->
          </div>
        </div>

        <!-- Form -->
        <div class="md:w-3/5 p-12">
          <h3 class="text-2xl font-bold text-elite-ink mb-8">Send us a Message</h3>
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-sm font-medium text-slate-700">Name</label>
                <input 
                  v-model="form.name"
                  type="text" 
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-elite-gold focus:ring-1 focus:ring-elite-gold outline-none transition-all"
                  placeholder="Your Name"
                  required
                />
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium text-slate-700">Contact</label>
                <input 
                  v-model="form.contact"
                  type="text" 
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-elite-gold focus:ring-1 focus:ring-elite-gold outline-none transition-all"
                  placeholder="Phone / Email"
                  required
                />
              </div>
            </div>
            
            <div class="space-y-2">
              <label class="text-sm font-medium text-slate-700">Message</label>
              <textarea 
                v-model="form.message"
                rows="4" 
                class="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-elite-gold focus:ring-1 focus:ring-elite-gold outline-none transition-all resize-none"
                placeholder="How can we help you?"
              ></textarea>
            </div>

            <button 
              type="submit" 
              class="w-full py-4 bg-elite-ink text-white rounded-xl font-medium tracking-wide hover:bg-slate-800 transition-colors shadow-lg shadow-elite-ink/20 flex justify-center items-center"
              :disabled="loading"
            >
              <span v-if="!loading">Send Message</span>
              <span v-else class="animate-pulse">Sending...</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { message } from 'ant-design-vue';
import http from '../../api/http';

const form = reactive({
  name: '',
  contact: '',
  message: ''
});

const loading = ref(false);

const handleSubmit = async () => {
  if (!form.name || !form.contact) {
    message.warning('Please fill in your name and contact info.');
    return;
  }

  loading.value = true;
  try {
    await http.post('/api/inquiries', {
      name: form.name,
      phone: form.contact,
      message: form.message,
      source: 'website_redesign',
    });
    message.success('Message sent successfully! We will contact you soon.');
    form.name = '';
    form.contact = '';
    form.message = '';
  } catch (error) {
    message.error('Failed to send message. Please try again.');
  } finally {
    loading.value = false;
  }
};
</script>
