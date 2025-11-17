<template>
  <div class="geometry-lesson">
    <section class="hero surface-card">
      <div>
        <h1>图形的周长与面积</h1>
        <p>
          面向六年级同学，我们将一起复习常见平面图形——正方形、长方形、平行四边形、三角形、等腰三角形以及圆——的周长和面积公式。
          每个图形都配有图示、公式说明和计算小贴士，帮助你举一反三。
        </p>
      </div>
      <div class="tips">
        <div class="tip-card" v-for="tip in heroTips" :key="tip.title">
          <h3>{{ tip.title }}</h3>
          <p>{{ tip.desc }}</p>
        </div>
      </div>
    </section>

    <section class="section" v-for="shape in shapes" :key="shape.key">
      <a-card :title="shape.title" :bordered="false">
        <div class="shape-content">
          <div class="shape-info">
            <p class="description">{{ shape.description }}</p>
            <div class="formula-block">
              <h4>周长公式</h4>
              <p class="formula">{{ shape.perimeter }}</p>
              <p class="note">{{ shape.perimeterNote }}</p>
            </div>
            <div class="formula-block">
              <h4>面积公式</h4>
              <p class="formula">{{ shape.area }}</p>
              <p class="note">{{ shape.areaNote }}</p>
            </div>
          </div>
          <div class="shape-figure">
            <svg :viewBox="shape.svg.viewBox" xmlns="http://www.w3.org/2000/svg">
              <path
                v-if="shape.svg.path"
                :d="shape.svg.path"
                :class="['figure-path', shape.svg.variant || '']"
              />
              <circle
                v-if="shape.svg.circle"
                class="circle-outline"
                :cx="shape.svg.circle.cx"
                :cy="shape.svg.circle.cy"
                :r="shape.svg.circle.r"
              />
              <line
                v-for="(line, index) in shape.svg.lines || []"
                :key="`line-${index}`"
                :x1="line.x1"
                :y1="line.y1"
                :x2="line.x2"
                :y2="line.y2"
                :class="['figure-line', { dashed: line.dashed }]"
              />
              <circle
                v-for="(point, index) in shape.svg.points || []"
                :key="`point-${index}`"
                class="center-point"
                :cx="point.cx"
                :cy="point.cy"
                :r="point.r"
              />
              <text
                v-for="label in shape.svg.labels"
                :key="label.text"
                :x="label.x"
                :y="label.y"
              >
                {{ label.text }}
              </text>
            </svg>
          </div>
        </div>
        <a-divider />
        <div class="example">
          <h4>示例练习</h4>
          <p>{{ shape.example }}</p>
        </div>
      </a-card>
    </section>
  </div>
</template>

<script setup>
const heroTips = [
  { title: '看懂符号', desc: '周长常用 P 表示，面积常用 S 或 A 表示；理解字母含义能帮你快速记忆公式。' },
  { title: '画图辅助', desc: '遇到复杂图形可以画出标记，拆分成熟悉的基本图形再计算。' },
  { title: '单位一致', desc: '周长用“厘米/米”等长度单位，面积用“平方厘米/平方米”，计算前务必统一单位。' },
];

const shapes = [
  {
    key: 'square',
    title: '正方形',
    description: '四条边都相等，四个角都是直角。边长常用 a 表示。',
    perimeter: 'P = 4a',
    perimeterNote: '把一条边的长度乘以 4。',
    area: 'S = a × a = a²',
    areaNote: '也可以记作“边长的平方”。',
    example: '例：边长 6 cm 的正方形，周长 4×6 = 24 cm，面积 6×6 = 36 cm²。',
    svg: {
      viewBox: '0 0 120 120',
      path: 'M20 20 H100 V100 H20 Z',
      variant: 'square',
      labels: [
        { text: 'a', x: 60, y: 16 },
        { text: 'a', x: 102, y: 60 },
      ],
    },
  },
  {
    key: 'rectangle',
    title: '长方形',
    description: '对边相等且平行，四角都是直角。长和宽分别用 a、b 表示。',
    perimeter: 'P = 2(a + b)',
    perimeterNote: '先计算长加宽，再乘以 2。',
    area: 'S = a × b',
    areaNote: '长乘宽即可得到面积。',
    example: '例：长 8 cm、宽 5 cm 的长方形，周长 2×(8+5)=26 cm，面积 8×5=40 cm²。',
    svg: {
      viewBox: '0 0 150 110',
      path: 'M20 30 H140 V90 H20 Z',
      variant: 'rectangle',
      labels: [
        { text: 'a', x: 80, y: 26 },
        { text: 'b', x: 144, y: 64 },
      ],
    },
  },
  {
    key: 'parallelogram',
    title: '平行四边形',
    description: '对边相等且平行，高 h 垂直于底边。',
    perimeter: 'P = 2(a + b)',
    perimeterNote: '周长计算与长方形相同。',
    area: 'S = a × h',
    areaNote: '面积等于底边乘以对应的高。',
    example: '例：底边 7 cm、高 4 cm 的平行四边形，面积 7×4 = 28 cm²。',
    svg: {
      viewBox: '0 0 180 130',
      path: 'M30 90 L70 30 L150 30 L110 90 Z',
      variant: 'parallelogram',
      lines: [
        { x1: 70, y1: 30, x2: 70, y2: 90, dashed: true },
      ],
      labels: [
        { text: 'a', x: 80, y: 112 },
        { text: 'h', x: 74, y: 60 },
      ],
    },
  },
  {
    key: 'triangle',
    title: '三角形',
    description: '任意三条边围成的图形，高 h 垂直于底边 a。',
    perimeter: 'P = a + b + c',
    perimeterNote: '三条边相加即可。',
    area: 'S = (a × h) ÷ 2',
    areaNote: '底乘高再除以 2。注意高必须垂直于底。',
    example: '例：底 10 cm、高 6 cm 的三角形，面积 (10×6)÷2 = 30 cm²。',
    svg: {
      viewBox: '0 0 150 140',
      path: 'M20 120 L75 30 L130 120 Z',
      variant: 'triangle',
      lines: [
        { x1: 75, y1: 30, x2: 75, y2: 120, dashed: true },
      ],
      labels: [
        { text: 'a', x: 75, y: 134 },
        { text: 'h', x: 79, y: 74 },
      ],
    },
  },
  {
    key: 'isoscelesTriangle',
    title: '等腰三角形',
    description: '两条边相等，顶角的高既是中线也是角平分线。',
    perimeter: 'P = 2a + b',
    perimeterNote: '两腰相等，加上底边。',
    area: 'S = (b × h) ÷ 2',
    areaNote: '与普通三角形面积公式相同，h 为底边对应的高。',
    example: '例：腰长 5 cm、底 8 cm、高 4 cm，周长 2×5+8=18 cm，面积 (8×4)÷2=16 cm²。',
    svg: {
      viewBox: '0 0 150 140',
      path: 'M20 120 L75 30 L130 120 Z',
      variant: 'triangle',
      lines: [
        { x1: 75, y1: 30, x2: 75, y2: 120, dashed: true },
      ],
      labels: [
        { text: 'a', x: 38, y: 74 },
        { text: 'a', x: 112, y: 74 },
        { text: 'b', x: 75, y: 134 },
        { text: 'h', x: 79, y: 74 },
      ],
    },
  },
  {
    key: 'circle',
    title: '圆',
    description: '由无数个到圆心距离相等的点组成，半径用 r 表示。',
    perimeter: '周长 C = 2πr',
    perimeterNote: '把半径乘以 2，再乘以 π（3.14 或 22/7）。',
    area: '面积 S = πr²',
    areaNote: '圆的面积等于半径的平方乘以 π。',
    example: '例：半径 7 cm 的圆，周长约 2×3.14×7≈43.96 cm，面积约 3.14×7²≈153.86 cm²。',
    svg: {
      viewBox: '0 0 180 180',
      circle: { cx: 90, cy: 90, r: 70 },
      variant: 'circle',
      lines: [
        { x1: 90, y1: 90, x2: 160, y2: 90, dashed: false },
      ],
      points: [{ cx: 90, cy: 90, r: 3 }],
      labels: [
        { text: 'r', x: 126, y: 84 },
        { text: 'O', x: 94, y: 96 },
      ],
    },
  },
];

const skillTips = [
  { icon: '✂️', title: '拆分与拼合', desc: '复杂图形可以拆成多个简单图形，如两个三角形或一个矩形加一个三角形。' },
  { icon: '📏', title: '熟悉常见比例', desc: '等腰三角形、正方形等特殊图形常和对称、比例联系在一起，记住特征能提高速度。' },
  { icon: '🔄', title: '检查单位', desc: '把“厘米”和“米”统一后再计算，避免因单位不一致导致结果错误。' },
  { icon: '🧮', title: '善用分数', desc: '遇到 ÷2 或 ×½ 的情况，用分数计算更直观，可以减少失误。' },
  { icon: '📝', title: '带上草稿', desc: '草稿纸上标注数据、画图示可以帮助你理清思路，是解题好帮手。' },
  { icon: '🌟', title: '多做练习', desc: '记住公式的最好方法就是多练习，并尝试自己出题、自己算。' },
];

const practiceQuestions = [
  '边长 9 cm 的正方形，它的周长和面积各是多少？',
  '长方形长 12 cm，宽是长的一半。求周长和面积。',
  '底边 15 cm、高 8 cm 的平行四边形面积是多少？',
  '三角形三边长分别为 7 cm、9 cm、11 cm，求周长。若其底边长 9 cm，对应高为 5 cm，求面积。',
  '一个等腰三角形的腰长 6 cm，底边 10 cm。周长是多少？如果底边对应的高为 4 cm，面积是多少？',
  '一个圆的周长是 31.4 cm，求它的半径和面积。（提示：取 π≈3.14）',
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
</script>

<style scoped>
.geometry-lesson {
  display: flex;
  flex-direction: column;
  gap: 24px;
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
  gap: 24px;
  padding: 28px 32px;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
}

.hero-left {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.hero-brand {
  display: flex;
  align-items: center;
  gap: 16px;
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
  color: #4a5568;
}

.hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.hero-stats {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.stat {
  min-width: 110px;
  padding: 12px 16px;
  border-radius: 12px;
  background: #f5f7fa;
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

.tips {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.tip-card {
  flex: 1 1 200px;
  background: linear-gradient(135deg, #edf2ff, #f8faff);
  border-radius: 14px;
  padding: 16px;
}

.section {
  padding: 24px 30px;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid #e5e9f0;
}

.section.alt {
  background: #f8fafc;
}

.section-header {
  margin-bottom: 16px;
}

.section-header h2 {
  margin-bottom: 6px;
}

.section-header p {
  color: #627085;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 18px;
}

.course-card {
  border: 1px solid #dfe5ef;
  border-radius: 16px;
  padding: 18px;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.course-icon {
  font-size: 28px;
}

.course-card ul {
  padding-left: 18px;
  margin: 0;
  color: #4a5568;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 18px;
}

.feature-card {
  padding: 18px;
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid #e5e9f0;
}

.feature-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.teacher-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 18px;
}

.teacher-card {
  display: flex;
  gap: 16px;
  border: 1px solid #e5e9f0;
  border-radius: 16px;
  padding: 18px;
  background: #ffffff;
}

.teacher-avatar {
  width: 54px;
  height: 54px;
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
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 18px;
}

.result-card {
  border: 1px solid #e5e9f0;
  border-radius: 16px;
  padding: 18px;
  background: #ffffff;
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
  color: #0f766e;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.practice-list {
  margin: 12px 0 0;
  padding-left: 22px;
  color: #4a5568;
}

.shape-content {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.shape-info {
  flex: 1 1 260px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.description {
  color: #4a5568;
}

.formula-block {
  background: #f5f7fa;
  border-radius: 12px;
  padding: 12px 16px;
}

.formula {
  font-weight: 600;
  color: #0f766e;
}

.note {
  margin: 4px 0 0;
  color: #627085;
  font-size: 13px;
}

.shape-figure {
  flex: 1 1 220px;
  display: flex;
  align-items: center;
  justify-content: center;
}

svg {
  width: 220px;
  max-width: 100%;
}

.figure-path {
  fill: rgba(59, 130, 246, 0.12);
  stroke: #2563eb;
  stroke-width: 2;
}

.figure-path.parallelogram {
  fill: rgba(245, 158, 11, 0.12);
  stroke: #d97706;
}

.figure-path.triangle {
  fill: rgba(244, 114, 182, 0.12);
  stroke: #db2777;
}

.circle-outline {
  fill: rgba(16, 185, 129, 0.12);
  stroke: #059669;
  stroke-width: 2;
}

.figure-line {
  stroke: #1d4ed8;
  stroke-width: 2;
}

.figure-line.dashed {
  stroke-dasharray: 6 4;
}

.center-point {
  fill: #ef4444;
}

text {
  font-size: 12px;
  fill: #1f2937;
  font-weight: 600;
}

.skill-tip {
  display: flex;
  gap: 12px;
  padding: 16px;
  border-radius: 14px;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
}

.skill-tip .icon {
  font-size: 24px;
}

@media (max-width: 768px) {
  .hero {
    padding: 22px;
  }

  .section {
    padding: 20px;
  }
}
</style>
