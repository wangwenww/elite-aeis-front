<template>
  <div class="payment-page bg-gray-100 min-h-screen py-8">
    <!-- Control Panel -->
    <div class="max-w-[210mm] mx-auto mb-4 flex justify-end gap-4 print:hidden">
      <a-button @click="clearForm" danger size="large">重置清空</a-button>
      <a-button type="primary" size="large" class="bg-blue-600 hover:bg-blue-700" @click="exportToPDF">保存为PDF</a-button>
    </div>

    <!-- A4 Paper Container -->
    <div id="invoice-container" class="invoice-container bg-white shadow-lg mx-auto relative">
      <!-- Content Wrapper -->
      <div class="p-8 h-full flex flex-col relative">
        
        <!-- Header -->
        <div class="mb-4 text-center">
          <div class="flex justify-center mb-2">
             <img src="../../assets/elite-logo.png" alt="Elite Education" class="h-16 object-contain" />
          </div>
          <div class="border-t-2 border-gray-300 my-1"></div>
          <h1 class="text-xl font-bold mb-1">School Fee Invoice</h1>
          <h1 class="text-xl font-bold">课程缴费单</h1>
        </div>

        <!-- Info Grid -->
        <div class="grid grid-cols-[200px_1fr_1fr_1fr] border-t border-l border-gray-400 mt-4 text-sm text-left">
           <!-- Row 1: Date -->
           <div class="p-2 font-bold border-b border-r border-gray-400 flex items-center">DATE</div>
           <div class="p-2 border-b border-r border-gray-400 font-bold col-span-3">
             {{ currentDate }}
           </div>
           
           <!-- Row 2: Receipt No -->
           <div class="p-2 font-bold border-b border-r border-gray-400 flex items-center">RECEIPT NO.</div>
           <div class="p-0 border-b border-r border-gray-400 bg-white col-span-3">
             <input v-model="receiptNo" class="w-full h-full px-2 outline-none font-bold bg-transparent" />
           </div>

           <!-- Row 3: Student Name -->
           <div class="p-2 font-bold border-b border-r border-gray-400 flex items-center">Student Name/学生姓名:</div>
           <div class="p-0 border-b border-r border-gray-400 col-span-3 bg-white">
              <input v-model="studentName" class="w-full h-full px-2 outline-none font-bold bg-transparent" />
           </div>
        </div>

        <!-- Spacer -->
        <div class="h-4"></div>

        <!-- Items Table -->
        <div class="border-t border-l border-gray-400 text-sm">
           <!-- Header -->
           <div class="grid grid-cols-[50px_1fr_100px_120px_120px] font-bold text-center">
             <div class="border-b border-r border-gray-400 p-2"></div> <!-- Index column empty header -->
             <div class="border-b border-r border-gray-400 p-2">DESCRIPTION</div>
             <div class="border-b border-r border-gray-400 p-2">QTY</div>
             <div class="border-b border-r border-gray-400 p-2">UNIT PRICE</div>
             <div class="border-b border-r border-gray-400 p-2">TOTAL</div>
           </div>

           <!-- Rows -->
           <div v-for="(row, index) in tableData" :key="index" 
                class="grid grid-cols-[50px_1fr_100px_120px_120px] text-center h-10 group"
                :class="index % 2 !== 0 ? 'bg-gray-100' : 'bg-white'">
             
             <!-- Index -->
             <div class="border-b border-r border-gray-400 flex items-center justify-center font-bold">
               {{ index + 1 }}
             </div>
             
             <!-- Description -->
             <div class="border-b border-r border-gray-400 p-0 relative">
               <input v-model="row.description" class="w-full h-full px-2 text-center bg-transparent outline-none" />
             </div>

             <!-- Qty -->
             <div class="border-b border-r border-gray-400 p-0 relative">
               <input type="number" v-model="row.qty" 
                      @input="calculateRowTotal(row)"
                      class="w-full h-full px-2 text-center bg-transparent outline-none no-arrows" />
             </div>

             <!-- Unit Price -->
             <div class="border-b border-r border-gray-400 p-0 relative">
               <input type="number" v-model="row.unitPrice" 
                     @input="calculateRowTotal(row)"
                     class="w-full h-full px-2 text-center bg-transparent outline-none no-arrows" />
             </div>

             <!-- Total -->
             <div class="border-b border-r border-gray-400 flex items-center justify-center font-bold">
               <span v-if="row.total">{{ formatCurrency(row.total) }}</span>
             </div>
           </div>
           
           <!-- Grand Total -->
           <div class="grid grid-cols-[200px_1fr] border-b border-r border-l border-gray-400 h-10 font-bold text-lg">
             <div class="border-r border-gray-400 flex items-center px-4">Grand Total:</div>
             <div class="flex items-center px-4">{{ grandTotal > 0 ? formatCurrency(grandTotal) : '' }}</div>
           </div>
           
           <!-- Note -->
           <div class="grid grid-cols-[200px_1fr] border-b border-r border-l border-gray-400 h-24 text-left">
             <div class="border-r border-gray-400 font-bold flex items-center px-4">Note/备注:</div>
             <div class="p-2">
               <textarea v-model="note" class="w-full h-full resize-none bg-transparent outline-none"></textarea>
             </div>
           </div>
        </div>

        <!-- Stamp -->
        <div class="absolute bottom-32 right-16 pointer-events-none">
          <div class="stamp-container">
             <img src="../../assets/company-seal.png" alt="Company Seal" class="w-[200px] h-[200px] object-contain opacity-80" />
          </div>
        </div>

      </div>
    </div>
    <!-- Floating Course Library Sidebar -->
    <div 
      class="fixed left-0 top-20 bottom-0 z-50 transition-transform duration-300 ease-in-out bg-white shadow-2xl border-r border-gray-200 flex flex-col print:hidden"
      :class="libraryOpen ? 'translate-x-0' : '-translate-x-full'"
      style="width: 320px;"
    >
      <div class="absolute top-1/2 -right-8 transform -translate-y-1/2">
        <button 
          @click="libraryOpen = !libraryOpen"
          class="bg-blue-600 text-white p-2 rounded-r-lg shadow-md hover:bg-blue-700 flex flex-col items-center gap-1 text-xs"
          title="Toggle Course Library"
        >
          <span class="writing-mode-vertical py-1">课程库</span>
          <component :is="libraryOpen ? 'MenuFoldOutlined' : 'MenuUnfoldOutlined'" />
        </button>
      </div>
      
      <div class="flex-1 overflow-hidden p-4">
        <CourseLibrary 
          :courses="courses" 
          :loading="coursesLoading" 
          :format-amount="formatAmount"
          @select-course="handleCourseSelect"
          @manage-courses="() => {}"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import dayjs from 'dayjs';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons-vue';
import { studentApi } from '../../api/student';
import { courseApi } from '../../api/course';
import CourseLibrary from '../../components/schedule/CourseLibrary.vue';

// Utility: Generate Receipt No
const generateReceiptNo = () => {
  const randomDigits = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join('');
  return `E-${randomDigits}`;
};

// State
const receiptNo = ref(generateReceiptNo());
const studentName = ref('');
const currentDate = ref(dayjs().format('YYYY/MM/DD'));
const note = ref('');
const libraryOpen = ref(false);
const courses = ref([]);
const coursesLoading = ref(false);

// Generate 9 rows
const tableData = ref(Array.from({ length: 9 }).map(() => ({
  description: '',
  qty: null,
  unitPrice: null,
  total: null
})));

// Actions
const clearForm = () => {
    if(!confirm('Are you sure you want to clear all contents? / 确定清空所有内容吗？')) return;
    studentName.value = '';
    receiptNo.value = generateReceiptNo();
    note.value = '';
    tableData.value = Array.from({ length: 9 }).map(() => ({
        description: '',
        qty: null,
        unitPrice: null,
        total: null
    }));
}

// Calculations
const calculateRowTotal = (row) => {
  if (row.qty && row.unitPrice) {
    row.total = Number(row.qty) * Number(row.unitPrice);
  } else {
    row.total = null;
  }
};

const grandTotal = computed(() => {
  return tableData.value.reduce((sum, row) => sum + (row.total || 0), 0);
});

const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val).replace('$', '');
};

// Helper for formatting logic reuse
const formatAmount = (amount, currency = 'CNY') => {
  const symbol = currency === 'USD' ? '$' : (currency === 'SGD' ? 'S$' : '¥');
  return `${symbol}${Number(amount || 0).toFixed(2)}`;
};

const fetchCourses = async () => {
  coursesLoading.value = true;
  try {
    const response = await courseApi.getCourses();
    const data = response.data;
    courses.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Failed to load courses:', error);
  } finally {
    coursesLoading.value = false;
  }
};

const handleCourseSelect = (course) => {
  // Find first empty row
  const emptyRow = tableData.value.find(row => !row.description && !row.qty && !row.unitPrice);
  
  if (emptyRow) {
    emptyRow.description = course.name;
    emptyRow.qty = 1;
    emptyRow.unitPrice = course.price;
    calculateRowTotal(emptyRow);
  } else {
    alert('表格已满 / Table is full');
  }
};

watch(tableData, () => {
    tableData.value.forEach(row => calculateRowTotal(row));
}, { deep: true });

// Export to PDF
const exportToPDF = async () => {
  if (libraryOpen.value) libraryOpen.value = false; // Close sidebar before print
  
  // Slight delay to allow sidebar to close
  setTimeout(async () => {
      const element = document.getElementById('invoice-container');
      
      try {
        const canvas = await html2canvas(element, {
          scale: 2, // Higher resolution
          useCORS: true,
          logging: false
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Invoice_${receiptNo.value}_${studentName.value || 'Student'}.pdf`);
      } catch (error) {
        console.error('PDF Generation failed', error);
        alert('Failed to generate PDF');
      }
  }, 300);
};

onMounted(() => {
  fetchCourses();
});
</script>

<style scoped>
.writing-mode-vertical {
  writing-mode: vertical-rl;
}

@media print {
  .print\:hidden {
    display: none !important;
  }
}

/* A4 Dimensions for screen display */
.invoice-container {
  width: 210mm;
  height: 297mm;
  box-sizing: border-box;
}

/* Remove arrows from number input */
.no-arrows::-webkit-outer-spin-button,
.no-arrows::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.no-arrows {
  -moz-appearance: textfield;
}

.stamp-container {
  transform: rotate(-15deg);
  opacity: 0.8;
}
</style>
