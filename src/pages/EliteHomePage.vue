<template>
  <div class="elite-home">
    <!-- 顶部品牌区 -->
    <section class="hero surface-card">
      <div class="hero-left">
        <div class="hero-brand">
          <img :src="logoUrl" alt="Elite Edu Logo" class="hero-logo" />
          <div>
            <h1 class="hero-title">新加坡壹立教育 · Elite Edu</h1>
            <p class="hero-desc">国际化视野 · 专业稳重 · 结果导向的精英教育机构</p>
          </div>
        </div>
        <div class="hero-actions">
          <a-button type="primary" size="large" @click="scrollTo('contact')">预约咨询</a-button>
          <a-button size="large" @click="scrollTo('courses')">了解课程</a-button>
        </div>
        <div class="hero-stats">
          <div class="stat">
            <div class="stat-value">95%</div>
            <div class="stat-label">录取率</div>
          </div>
          <div class="stat">
            <div class="stat-value">500+</div>
            <div class="stat-label">成功案例</div>
          </div>
          <div class="stat">
            <div class="stat-value">10+</div>
            <div class="stat-label">资深教师</div>
          </div>
        </div>
      </div>
      <div class="hero-right">
        <a-card :bordered="false" class="hero-form">
          <template #title>快速预约</template>
          <a-form layout="vertical">
            <a-form-item label="学生姓名">
              <a-input v-model:value="form.name" placeholder="请输入学生姓名" />
            </a-form-item>
            <a-form-item label="联系方式">
              <a-input v-model:value="form.phone" placeholder="手机 / 微信 / Email" />
            </a-form-item>
            <a-form-item label="意向课程">
              <a-select v-model:value="form.intent" :options="courseOptions" placeholder="请选择课程类型" />
            </a-form-item>
            <a-button type="primary" block :loading="submitting" @click="submitForm">提交预约</a-button>
          </a-form>
        </a-card>
      </div>
    </section>

    <!-- 核心课程 -->
    <section id="courses" class="section">
      <header class="section-header">
        <h2>核心课程体系</h2>
        <p>覆盖 AEIS 备考 / 小学衔接 / 特色提升多条路径，为不同阶段学生提供定制化方案。</p>
      </header>
      <div class="card-grid">
        <div class="course-card" v-for="card in courseCards" :key="card.key">
          <div class="course-icon">{{ card.icon }}</div>
          <h3>{{ card.title }}</h3>
          <p>{{ card.desc }}</p>
          <ul>
            <li v-for="item in card.features" :key="item">{{ item }}</li>
          </ul>
          <a-button type="link" @click="scrollTo('contact')">咨询详情 →</a-button>
        </div>
      </div>
    </section>

    <!-- 教学特色 -->
    <section class="section alt">
      <header class="section-header">
        <h2>教学特色</h2>
        <p>以结果为导向的个性化教学方案，结合数据化评测，持续关注每位学生的成长。</p>
      </header>
      <div class="feature-grid">
        <div class="feature-card" v-for="item in features" :key="item.title">
          <div class="feature-icon">{{ item.icon }}</div>
          <h3>{{ item.title }}</h3>
          <p>{{ item.desc }}</p>
        </div>
      </div>
    </section>

    <!-- 师资力量 -->
    <section class="section">
      <header class="section-header">
        <h2>资深师资团队</h2>
        <p>严选具备国际教学经验的教师，为学生的学习保驾护航。</p>
      </header>
      <div class="teacher-grid">
        <div class="teacher-card" v-for="teacher in teachers" :key="teacher.name">
          <div class="teacher-avatar">{{ teacher.initials }}</div>
          <div>
            <h3>{{ teacher.name }}</h3>
            <p class="teacher-title">{{ teacher.title }}</p>
            <p>{{ teacher.bio }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 成功案例 -->
    <section class="section alt">
      <header class="section-header">
        <h2>学生成功故事</h2>
        <p>用事实说话，见证精英教育的成果。</p>
      </header>
      <div class="result-grid">
        <div class="result-card" v-for="c in cases" :key="c.name">
          <div class="result-header">
            <div class="student-avatar">{{ getInitials(c.name) }}</div>
            <div class="result-badge">成功录取</div>
          </div>
          <h3>{{ c.name }}</h3>
          <p class="result-track">{{ c.track }}</p>
          <p>{{ c.result }}</p>
        </div>
      </div>
    </section>

    <!-- 关于我们 -->
    <section class="section">
      <header class="section-header">
        <h2>关于 Elite Edu</h2>
        <p>源自对教育品质的极致追求，坚持“学术为本、结果导向、人格并重”的理念。</p>
      </header>
      <a-card :bordered="false">
        <p>
          我们深耕新加坡本地与国际教育，整合优质教师资源与评测工具，为不同阶段的学生提供定制化学习方案。
          从入学评估、学习规划到升学指导，全面提升学生的学术能力与综合素养。
        </p>
      </a-card>
    </section>

    <!-- 联系我们 -->
    <section id="contact" class="section alt">
      <header class="section-header">
        <h2>联系我们</h2>
        <p>欢迎留下需求，我们的顾问将尽快与您联系。</p>
      </header>
      <a-row :gutter="[16, 16]">
        <a-col :xs="24" :md="14">
          <a-card :bordered="false">
            <a-form layout="vertical">
              <a-form-item label="姓名">
                <a-input v-model:value="form2.name" placeholder="您的姓名" />
              </a-form-item>
              <a-form-item label="联系方式">
                <a-input v-model:value="form2.contact" placeholder="手机 / 微信 / Email" />
              </a-form-item>
              <a-form-item label="留言">
                <a-textarea v-model:value="form2.message" :rows="4" placeholder="您的需求 / 问题" />
              </a-form-item>
              <a-space>
                <a-button @click="resetContact">重置</a-button>
                <a-button type="primary" :loading="submitting2" @click="submitContact">提交</a-button>
              </a-space>
            </a-form>
          </a-card>
        </a-col>
        <a-col :xs="24" :md="10">
          <a-card :bordered="false" class="contact-info">
            <p><strong>地址：</strong>Singapore · Central Area</p>
            <p><strong>邮箱：</strong>contact@elite-edu.sg</p>
            <p><strong>电话：</strong>+65-0000-0000</p>
          </a-card>
        </a-col>
      </a-row>
    </section>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { message } from 'ant-design-vue';
import http from '../api/http';

const logoUrl = new URL('../assets/elite-logo.png', import.meta.url).href;

const form = reactive({ name: '', phone: '', intent: undefined });
const form2 = reactive({ name: '', contact: '', message: '' });
const submitting = ref(false);
const submitting2 = ref(false);

const courseOptions = [
  { label: 'AEIS 备考', value: 'aeis' },
  { label: '小学衔接', value: 'primary' },
  { label: '特色提升', value: 'special' },
];

const courseCards = [
  {
    key: 'aeis',
    title: 'AEIS 全周期备考',
    icon: '🎯',
    desc: '分段目标拆解 + 模考评测 + 升学规划',
    features: ['入学诊断', '阶段模考', '升学面试辅导'],
  },
  {
    key: 'primary',
    title: '新加坡小学衔接',
    icon: '📘',
    desc: '语言与学科学段衔接，迅速适应课程体系',
    features: ['语言适应', '课堂文化导入', '学习方法指导'],
  },
  {
    key: 'advance',
    title: '特色提升课程',
    icon: '🚀',
    desc: '薄弱点诊断，定制化强化方案，提升综合能力',
    features: ['竞赛培训', '学术写作', '口语表达'],
  },
];

const features = [
  { icon: '📈', title: '数据化评测', desc: '过程可视化，结果量化，持续追踪学习曲线' },
  { icon: '🧭', title: '个性化路径', desc: '基于诊断的分层/分项教学，因材施教' },
  { icon: '🧑‍🏫', title: '小班精品', desc: '控班规模，保障互动与反馈效率' },
  { icon: '🤝', title: '家校共育', desc: '定期汇报机制，家长随时掌握学习进度' },
  { icon: '🧠', title: '方法论沉淀', desc: '多年教研打磨，建立可迁移的学习能力' },
  { icon: '🌏', title: '国际视野', desc: '融合国际标准与本地课程要求' },
];

const teachers = [
  { initials: 'JL', name: 'Jane Lee', title: 'Senior English Teacher', bio: '10+年国际课程教学经验，擅长学术写作与阅读策略。' },
  { initials: 'MK', name: 'Michael Koh', title: 'Mathematics Lead', bio: '竞赛与升学指导双栖，建立体系化解题思维。' },
  { initials: 'CW', name: 'Chen Wei', title: 'Primary Transition', bio: '小学衔接专项，快速适应本地课程与课堂文化。' },
];

const cases = [
  { name: 'Dennis', track: 'AEIS Transition', result: '3 个月成绩提升显著，顺利通过 AEIS 并录取本地学校。' },
  { name: 'MJR', track: 'Math Enhance', result: '目标化训练，期末数学 A。' },
  { name: 'Alice', track: 'Primary Join', result: '完成语言与课程双重适应，综合评估优秀。' },
];

function getInitials(name) {
  if (!name) return 'ED';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function scrollTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function submitForm() {
  if (!form.name || !form.phone) {
    message.warning('请填写姓名和联系方式');
    return;
  }
  submitting.value = true;
  try {
    await http.post('/api/inquiries', {
      name: form.name,
      phone: form.phone,
      intent: form.intent,
      source: 'website',
    });
    message.success('预约提交成功！我们会尽快与您联系。');
    form.name = '';
    form.phone = '';
    form.intent = undefined;
  } catch (error) {
    message.error(`提交失败：${error.response?.data?.detail || error.message || '未知错误'}`);
  } finally {
    submitting.value = false;
  }
}

function resetContact() {
  form2.name = '';
  form2.contact = '';
  form2.message = '';
}

async function submitContact() {
  if (!form2.name || !form2.contact) {
    message.warning('请填写姓名和联系方式');
    return;
  }
  submitting2.value = true;
  try {
    await http.post('/api/inquiries', {
      name: form2.name,
      phone: form2.contact,
      message: form2.message,
      source: 'website',
    });
    message.success('感谢您的联系，我们将尽快与您取得联系。');
    resetContact();
  } catch (error) {
    message.error(`提交失败：${error.response?.data?.detail || error.message || '未知错误'}`);
  } finally {
    submitting2.value = false;
  }
}
</script>

<style scoped>
.elite-home {
  display: flex;
  flex-direction: column;
  gap: 28px;
  color: #1f2937;
}

.surface-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
}

.hero {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 32px;
  padding: 32px;
}

.hero-brand {
  display: flex;
  align-items: center;
  gap: 18px;
}

.hero-logo {
  width: 64px;
  height: 64px;
}

.hero-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #102a43;
}

.hero-desc {
  margin: 6px 0 0;
  color: #475569;
}

.hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.hero-stats {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.stat {
  min-width: 110px;
  padding: 12px 16px;
  border-radius: 12px;
  background: #f2f5f9;
  text-align: center;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #0f766e;
}

.stat-label {
  margin-top: 4px;
  color: #64748b;
  font-size: 13px;
}

.section {
  padding: 26px 30px;
}

.section.alt {
  background: #f5f7fa;
  border-radius: 16px;
}

.section-header {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
}

.section-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
}

.section-header p {
  margin: 0;
  color: #64748b;
}

.card-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

.course-card {
  border: 1px solid #e5e9f0;
  border-radius: 16px;
  padding: 20px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: box-shadow 0.2s ease;
}

.course-card:hover {
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.08);
}

.course-icon {
  font-size: 28px;
}

.course-card ul {
  padding-left: 18px;
  margin: 0;
  color: #48566a;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 18px;
}

.feature-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  padding: 18px;
}

.feature-icon {
  font-size: 24px;
}

.teacher-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 18px;
}

.teacher-card {
  display: flex;
  gap: 16px;
  border-radius: 16px;
  border: 1px solid #e5e9f0;
  padding: 18px;
  background: #ffffff;
}

.teacher-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.teacher-title {
  color: #0f766e;
  font-weight: 500;
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 18px;
}

.result-card {
  border-radius: 16px;
  border: 1px solid #e5e9f0;
  background: #ffffff;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.student-avatar {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: #e0f2f1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #0f766e;
}

.result-badge {
  padding: 4px 10px;
  background: #ecfdf5;
  border-radius: 999px;
  color: #047857;
  font-size: 13px;
}

.result-track {
  color: #64748b;
}

.contact-info p {
  margin: 0 0 8px;
}

@media (max-width: 960px) {
  .hero {
    padding: 24px;
  }
}
</style>
