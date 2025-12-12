<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4">
    <div class="max-w-4xl mx-auto">
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h1 class="text-2xl font-bold text-gray-800 mb-6">AEIS 护照照片裁剪工具</h1>
        <p class="text-gray-600 mb-4">要求：410×514px，白色背景</p>

        <!-- 上传区域 -->
        <div v-if="!imageSrc" class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            @change="handleFileSelect"
            class="hidden"
          />
          <div class="space-y-4">
            <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <div>
              <button
                @click="$refs.fileInput.click()"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                选择照片
              </button>
            </div>
            <p class="text-sm text-gray-500">支持 JPG、PNG 格式</p>
          </div>
        </div>

        <!-- 裁剪区域 -->
        <div v-else class="space-y-6">
          <!-- 裁剪预览和操作区 -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- 左侧：裁剪画布 -->
            <div class="space-y-4">
              <h2 class="text-lg font-semibold text-gray-700">裁剪区域</h2>
              <div 
                ref="canvasContainer"
                class="relative border-2 border-gray-300 rounded-lg overflow-hidden bg-white" 
                style="aspect-ratio: 410/514;"
                @mousedown="startDrag"
                @mousemove="onDrag"
                @mouseup="endDrag"
                @mouseleave="endDrag"
              >
                <canvas
                  ref="canvas"
                  class="max-w-full h-auto pointer-events-none"
                ></canvas>
                <!-- 裁剪框 -->
                <div
                  ref="cropBox"
                  class="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-10 cursor-move"
                  :style="cropBoxStyle"
                  @mousedown.stop="startCropDrag"
                >
                  <div class="absolute inset-0 flex items-center justify-center text-blue-600 text-xs font-semibold pointer-events-none">
                    410×514px
                  </div>
                  <!-- 调整大小控制点 -->
                  <div
                    v-for="handle in resizeHandles"
                    :key="handle"
                    class="absolute w-4 h-4 bg-blue-500 border-2 border-white rounded-full z-10"
                    :class="getHandleCursor(handle)"
                    :style="getHandleStyle(handle)"
                    @mousedown.stop="startResize(handle, $event)"
                  ></div>
                </div>
              </div>
              
              <!-- 操作按钮 -->
              <div class="flex gap-3">
                <button
                  @click="resetImage"
                  class="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  重新选择
                </button>
                <button
                  @click="resetCrop"
                  class="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  重置裁剪
                </button>
              </div>
            </div>

            <!-- 右侧：预览 -->
            <div class="space-y-4">
              <h2 class="text-lg font-semibold text-gray-700">预览效果</h2>
              <div class="border-2 border-gray-300 rounded-lg overflow-hidden bg-white" style="aspect-ratio: 410/514;">
                <canvas ref="previewCanvas" class="w-full h-full"></canvas>
              </div>
              <div class="text-sm text-gray-600 space-y-1">
                <p>尺寸：410 × 514 像素</p>
                <p>背景：白色</p>
              </div>
            </div>
          </div>

          <!-- 下载按钮 -->
          <div class="flex justify-center pt-4 border-t">
            <button
              @click="downloadImage"
              class="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium text-lg"
            >
              下载裁剪后的照片
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'

const fileInput = ref(null)
const canvas = ref(null)
const previewCanvas = ref(null)
const cropBox = ref(null)
const canvasContainer = ref(null)

const imageSrc = ref(null)
const image = ref(null)
const cropBoxStyle = ref({
  width: '200px',
  height: '250px',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  cursor: 'move'
})

const TARGET_WIDTH = 410
const TARGET_HEIGHT = 514
const TARGET_RATIO = TARGET_WIDTH / TARGET_HEIGHT

let isDragging = false
let isResizing = false
let resizeHandle = null
let dragStart = { x: 0, y: 0 }
let cropBoxPos = { x: 0, y: 0, width: 200, height: 250 }
let canvasScale = 1
let canvasOffset = { x: 0, y: 0 }

const resizeHandles = ['nw', 'ne', 'sw', 'se']

function handleFileSelect(event) {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    imageSrc.value = e.target.result
    loadImage(e.target.result)
  }
  reader.readAsDataURL(file)
}

function loadImage(src) {
  const img = new Image()
  img.onload = () => {
    image.value = img
    nextTick(() => {
      setupCanvas()
      updatePreview()
    })
  }
  img.src = src
}

function setupCanvas() {
  const canvasEl = canvas.value
  const ctx = canvasEl.getContext('2d')
  const container = canvasContainer.value
  const containerRect = container.getBoundingClientRect()
  
  const containerWidth = containerRect.width
  const containerHeight = containerRect.height
  
  const img = image.value
  const imgRatio = img.width / img.height
  const containerRatio = containerWidth / containerHeight
  
  let drawWidth, drawHeight
  
  if (imgRatio > containerRatio) {
    drawWidth = containerWidth
    drawHeight = containerWidth / imgRatio
  } else {
    drawHeight = containerHeight
    drawWidth = containerHeight * imgRatio
  }
  
  canvasEl.width = drawWidth
  canvasEl.height = drawHeight
  
  canvasScale = img.width / drawWidth
  canvasOffset.x = (containerWidth - drawWidth) / 2
  canvasOffset.y = (containerHeight - drawHeight) / 2
  
  ctx.clearRect(0, 0, drawWidth, drawHeight)
  ctx.drawImage(img, 0, 0, drawWidth, drawHeight)
  
  // 初始化裁剪框
  const cropSize = Math.min(drawWidth * 0.6, drawHeight * 0.6)
  const cropWidth = cropSize
  const cropHeight = cropSize / TARGET_RATIO
  
  cropBoxPos.width = cropWidth
  cropBoxPos.height = cropHeight
  cropBoxPos.x = (drawWidth - cropWidth) / 2
  cropBoxPos.y = (drawHeight - cropHeight) / 2
  
  updateCropBoxStyle()
}

function updateCropBoxStyle() {
  cropBoxStyle.value = {
    width: `${cropBoxPos.width}px`,
    height: `${cropBoxPos.height}px`,
    left: `${canvasOffset.x + cropBoxPos.x}px`,
    top: `${canvasOffset.y + cropBoxPos.y}px`,
    cursor: isResizing ? 'nwse-resize' : 'move'
  }
}

function getHandleStyle(handle) {
  const positions = {
    nw: { left: '-6px', top: '-6px' },
    ne: { right: '-6px', top: '-6px' },
    sw: { left: '-6px', bottom: '-6px' },
    se: { right: '-6px', bottom: '-6px' }
  }
  return positions[handle]
}

function getHandleCursor(handle) {
  const cursors = {
    nw: 'cursor-nwse-resize',
    ne: 'cursor-nesw-resize',
    sw: 'cursor-nesw-resize',
    se: 'cursor-nwse-resize'
  }
  return cursors[handle]
}

function startCropDrag(event) {
  if (isResizing) return
  const rect = canvasContainer.value.getBoundingClientRect()
  const x = event.clientX - rect.left - canvasOffset.x
  const y = event.clientY - rect.top - canvasOffset.y
  
  isDragging = true
  dragStart.x = x - cropBoxPos.x
  dragStart.y = y - cropBoxPos.y
}

function startDrag(event) {
  // 这个函数现在只处理容器区域的点击，裁剪框的拖拽由startCropDrag处理
  // 如果需要点击空白区域重置选择，可以在这里添加逻辑
}

function onDrag(event) {
  if (!isDragging && !isResizing) return
  
  const rect = canvasContainer.value.getBoundingClientRect()
  const x = event.clientX - rect.left - canvasOffset.x
  const y = event.clientY - rect.top - canvasOffset.y
  
  if (isDragging) {
    const newX = x - dragStart.x
    const newY = y - dragStart.y
    
    const maxX = canvas.value.width - cropBoxPos.width
    const maxY = canvas.value.height - cropBoxPos.height
    
    cropBoxPos.x = Math.max(0, Math.min(newX, maxX))
    cropBoxPos.y = Math.max(0, Math.min(newY, maxY))
    
    updateCropBoxStyle()
    updatePreview()
  } else if (isResizing && resizeHandle) {
    // 调整大小逻辑，保持比例
    let newX = cropBoxPos.x
    let newY = cropBoxPos.y
    let newWidth = cropBoxPos.width
    let newHeight = cropBoxPos.height
    
    const deltaX = x - dragStart.x
    const deltaY = y - dragStart.y
    
    // 根据控制点位置计算新尺寸
    if (resizeHandle === 'se') {
      newWidth = cropBoxPos.width + deltaX
      newHeight = newWidth / TARGET_RATIO
    } else if (resizeHandle === 'sw') {
      newWidth = cropBoxPos.width - deltaX
      newHeight = newWidth / TARGET_RATIO
      newX = cropBoxPos.x + cropBoxPos.width - newWidth
    } else if (resizeHandle === 'ne') {
      newWidth = cropBoxPos.width + deltaX
      newHeight = newWidth / TARGET_RATIO
      newY = cropBoxPos.y + cropBoxPos.height - newHeight
    } else if (resizeHandle === 'nw') {
      newWidth = cropBoxPos.width - deltaX
      newHeight = newWidth / TARGET_RATIO
      newX = cropBoxPos.x + cropBoxPos.width - newWidth
      newY = cropBoxPos.y + cropBoxPos.height - newHeight
    }
    
    // 边界检查
    if (
      newWidth >= 50 &&
      newWidth <= canvas.value.width &&
      newHeight >= 50 &&
      newHeight <= canvas.value.height &&
      newX >= 0 &&
      newY >= 0 &&
      newX + newWidth <= canvas.value.width &&
      newY + newHeight <= canvas.value.height
    ) {
      cropBoxPos.x = newX
      cropBoxPos.y = newY
      cropBoxPos.width = newWidth
      cropBoxPos.height = newHeight
      
      dragStart.x = x
      dragStart.y = y
      
      updateCropBoxStyle()
      updatePreview()
    }
  }
}

function endDrag() {
  isDragging = false
  isResizing = false
  resizeHandle = null
}

function startResize(handle, event) {
  if (event) {
    event.stopPropagation()
    isResizing = true
    resizeHandle = handle
    const rect = canvasContainer.value.getBoundingClientRect()
    dragStart.x = event.clientX - rect.left - canvasOffset.x
    dragStart.y = event.clientY - rect.top - canvasOffset.y
  }
}

function resetImage() {
  imageSrc.value = null
  image.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function resetCrop() {
  setupCanvas()
  updatePreview()
}

function updatePreview() {
  if (!image.value || !previewCanvas.value) return
  
  const previewCtx = previewCanvas.value.getContext('2d')
  previewCanvas.value.width = TARGET_WIDTH
  previewCanvas.value.height = TARGET_HEIGHT
  
  // 填充白色背景
  previewCtx.fillStyle = '#FFFFFF'
  previewCtx.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT)
  
  // 计算源图像裁剪区域（实际像素）
  const srcX = cropBoxPos.x * canvasScale
  const srcY = cropBoxPos.y * canvasScale
  const srcWidth = cropBoxPos.width * canvasScale
  const srcHeight = cropBoxPos.height * canvasScale
  
  // 绘制裁剪后的图像
  previewCtx.drawImage(
    image.value,
    srcX, srcY, srcWidth, srcHeight,
    0, 0, TARGET_WIDTH, TARGET_HEIGHT
  )
}

function downloadImage() {
  if (!previewCanvas.value) return
  
  previewCanvas.value.toBlob((blob) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `aeis-photo-${Date.now()}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 'image/png', 1.0)
}

onMounted(() => {
  // 监听全局鼠标事件以支持拖拽
  document.addEventListener('mousemove', (e) => {
    if (isDragging || isResizing) {
      onDrag(e)
    }
  })
  document.addEventListener('mouseup', endDrag)
})
</script>

<style scoped>
canvas {
  display: block;
  user-select: none;
}
</style>

