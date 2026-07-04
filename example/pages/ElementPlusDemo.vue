<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useTheme, useLocalize, ElMessage, ElMessageBox, ElNotification } from '@bndynet/vue-site'

const { theme } = useTheme()
const { localize } = useLocalize()

const activeName = ref('buttons')

const inputVal = ref('')
const selectVal = ref('')
const switchVal = ref(true)
const sliderVal = ref(30)
const dateVal = ref('')
const radioVal = ref('option1')
const checkboxGroup = ref(['A'])
const rateVal = ref(3.5)

const tableData = [
  { name: 'Tom', age: 28, role: 'Developer', status: 'Active' },
  { name: 'Jerry', age: 34, role: 'Designer', status: 'Active' },
  { name: 'Alice', age: 25, role: 'PM', status: 'On Leave' },
  { name: 'Bob', age: 31, role: 'QA', status: 'Active' },
]

const formData = reactive({
  name: '',
  email: '',
  type: '',
  notify: true,
  description: '',
})

const dialogVisible = ref(false)
const drawerVisible = ref(false)
const loading = ref(false)
const percentage = ref(72)

function handleClick() {
  ElMessage.success(localize({ en: 'Button clicked!', zh: '按钮已点击！' }))
}

function handleConfirm() {
  ElMessageBox.confirm(
    localize({ en: 'This is a confirm dialog. Continue?', zh: '这是一个确认对话框。是否继续？' }),
    localize({ en: 'Confirm', zh: '确认' }),
    {
      confirmButtonText: localize({ en: 'OK', zh: '确定' }),
      cancelButtonText: localize({ en: 'Cancel', zh: '取消' }),
      type: 'warning',
    },
  )
    .then(() => ElMessage.success(localize({ en: 'Confirmed!', zh: '已确认！' })))
    .catch(() => ElMessage.info(localize({ en: 'Cancelled', zh: '已取消' })))
}

function showNotification() {
  ElNotification({
    title: localize({ en: 'Notification', zh: '通知' }),
    message: localize({ en: 'This is a notification message.', zh: '这是一条通知消息。' }),
    type: 'success',
  })
}

function handleLoadingClick() {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success(localize({ en: 'Loading completed!', zh: '加载完成！' }))
  }, 2000)
}
</script>

<template>
  <div class="ep-demo">
    <h1>{{ localize({ en: 'Element Plus Components', zh: 'Element Plus 组件' }) }}</h1>
    <p class="ep-subtitle">
      {{ localize({ en: 'Verify that Element Plus works correctly with the current theme:', zh: '验证 Element Plus 在当前主题下正常工作：' }) }}
      <el-tag :type="theme === 'light' || theme === 'sepia' ? '' : 'info'" effect="dark">
        {{ theme }}
      </el-tag>
    </p>

    <el-tabs v-model="activeName" type="border-card">
      <!-- Buttons & Tags -->
      <el-tab-pane :label="localize({ en: 'Buttons & Tags', zh: '按钮与标签' })" name="buttons">
        <h3>{{ localize({ en: 'Buttons', zh: '按钮' }) }}</h3>
        <el-space wrap>
          <el-button>Default</el-button>
          <el-button type="primary">Primary</el-button>
          <el-button type="success">Success</el-button>
          <el-button type="warning">Warning</el-button>
          <el-button type="danger">Danger</el-button>
          <el-button type="info">Info</el-button>
        </el-space>

        <el-space wrap style="margin-top: 12px">
          <el-button type="primary" plain>Plain</el-button>
          <el-button type="primary" round>Round</el-button>
          <el-button type="primary" :loading="loading" @click="handleLoadingClick">
            {{ loading ? localize({ en: 'Loading...', zh: '加载中…' }) : localize({ en: 'Click to Load', zh: '点击加载' }) }}
          </el-button>
          <el-button type="primary" disabled>Disabled</el-button>
        </el-space>

        <h3 style="margin-top: 24px">{{ localize({ en: 'Tags', zh: '标签' }) }}</h3>
        <el-space wrap>
          <el-tag>Default</el-tag>
          <el-tag type="success">Success</el-tag>
          <el-tag type="warning">Warning</el-tag>
          <el-tag type="danger">Danger</el-tag>
          <el-tag type="info">Info</el-tag>
          <el-tag effect="dark" type="primary">Dark Effect</el-tag>
          <el-tag effect="plain" type="primary">Plain Effect</el-tag>
          <el-tag closable>Closable</el-tag>
          <el-tag size="large">Large</el-tag>
          <el-tag size="small">Small</el-tag>
        </el-space>

        <h3 style="margin-top: 24px">{{ localize({ en: 'Badges & Progress', zh: '徽标与进度' }) }}</h3>
        <el-space :size="30">
          <el-badge :value="12">
            <el-button>Messages</el-button>
          </el-badge>
          <el-badge :value="200" :max="99">
            <el-button>Overflow</el-button>
          </el-badge>
          <el-badge value="new" type="success">
            <el-button>New</el-button>
          </el-badge>
          <el-badge is-dot>
            <el-button>Dot</el-button>
          </el-badge>
        </el-space>

        <div style="margin-top: 20px; max-width: 400px">
          <el-progress :percentage="percentage" :stroke-width="18" striped striped-flow />
          <el-progress :percentage="100" status="success" style="margin-top: 8px" />
          <el-progress :percentage="45" status="warning" style="margin-top: 8px" />
        </div>
      </el-tab-pane>

      <!-- Form Controls -->
      <el-tab-pane :label="localize({ en: 'Form Controls', zh: '表单控件' })" name="forms">
        <el-form label-width="120px" style="max-width: 500px">
          <el-form-item :label="localize({ en: 'Input', zh: '输入框' })">
            <el-input v-model="inputVal" :placeholder="localize({ en: 'Type something...', zh: '输入点什么…' })" clearable />
          </el-form-item>

          <el-form-item :label="localize({ en: 'Select', zh: '选择器' })">
            <el-select v-model="selectVal" :placeholder="localize({ en: 'Choose one', zh: '请选择' })" clearable>
              <el-option label="Option A" value="a" />
              <el-option label="Option B" value="b" />
              <el-option label="Option C" value="c" />
              <el-option :label="localize({ en: 'Option D (disabled)', zh: '选项 D（禁用）' })" value="d" disabled />
            </el-select>
          </el-form-item>

          <el-form-item :label="localize({ en: 'Date Picker', zh: '日期选择' })">
            <el-date-picker v-model="dateVal" type="date" :placeholder="localize({ en: 'Pick a date', zh: '选择日期' })" style="width: 100%" />
          </el-form-item>

          <el-form-item :label="localize({ en: 'Radio', zh: '单选' })">
            <el-radio-group v-model="radioVal">
              <el-radio value="option1">Option 1</el-radio>
              <el-radio value="option2">Option 2</el-radio>
              <el-radio value="option3" disabled>{{ localize({ en: 'Disabled', zh: '禁用' }) }}</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item :label="localize({ en: 'Checkbox', zh: '多选' })">
            <el-checkbox-group v-model="checkboxGroup">
              <el-checkbox label="A" value="A" />
              <el-checkbox label="B" value="B" />
              <el-checkbox label="C" value="C" />
            </el-checkbox-group>
          </el-form-item>

          <el-form-item :label="localize({ en: 'Switch', zh: '开关' })">
            <el-switch v-model="switchVal" active-text="ON" inactive-text="OFF" />
          </el-form-item>

          <el-form-item :label="localize({ en: 'Slider', zh: '滑块' })">
            <el-slider v-model="sliderVal" show-input />
          </el-form-item>

          <el-form-item :label="localize({ en: 'Rate', zh: '评分' })">
            <el-rate v-model="rateVal" allow-half show-score />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- Table -->
      <el-tab-pane :label="localize({ en: 'Table', zh: '表格' })" name="table">
        <el-table :data="tableData" stripe border style="width: 100%">
          <el-table-column prop="name" :label="localize({ en: 'Name', zh: '姓名' })" sortable />
          <el-table-column prop="age" :label="localize({ en: 'Age', zh: '年龄' })" sortable width="100" />
          <el-table-column prop="role" :label="localize({ en: 'Role', zh: '角色' })">
            <template #default="{ row }">
              <el-tag size="small">{{ row.role }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" :label="localize({ en: 'Status', zh: '状态' })" width="120">
            <template #default="{ row }">
              <el-tag
                :type="row.status === 'Active' ? 'success' : 'warning'"
                size="small"
                effect="light"
              >
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column :label="localize({ en: 'Actions', zh: '操作' })" width="150">
            <template #default>
              <el-button size="small" type="primary" link>{{ localize({ en: 'Edit', zh: '编辑' }) }}</el-button>
              <el-button size="small" type="danger" link>{{ localize({ en: 'Delete', zh: '删除' }) }}</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- Feedback -->
      <el-tab-pane :label="localize({ en: 'Feedback', zh: '反馈' })" name="feedback">
        <h3>{{ localize({ en: 'Alerts', zh: '提示' }) }}</h3>
        <el-space direction="vertical" fill style="width: 100%">
          <el-alert title="Success alert" type="success" show-icon />
          <el-alert title="Info alert" type="info" show-icon />
          <el-alert title="Warning alert" type="warning" show-icon />
          <el-alert title="Error alert — something went wrong" type="error" show-icon />
          <el-alert
            title="Closable alert with description"
            description="This is a longer description text that provides more context about the alert."
            type="info"
            show-icon
            closable
          />
        </el-space>

        <h3 style="margin-top: 24px">{{ localize({ en: 'Messages & Dialogs', zh: '消息与对话框' }) }}</h3>
        <el-space wrap>
          <el-button type="primary" @click="handleClick">{{ localize({ en: 'Message', zh: '消息' }) }}</el-button>
          <el-button type="warning" @click="handleConfirm">{{ localize({ en: 'Confirm Box', zh: '确认框' }) }}</el-button>
          <el-button type="success" @click="showNotification">{{ localize({ en: 'Notification', zh: '通知' }) }}</el-button>
          <el-button type="info" @click="dialogVisible = true">{{ localize({ en: 'Open Dialog', zh: '打开对话框' }) }}</el-button>
          <el-button @click="drawerVisible = true">{{ localize({ en: 'Open Drawer', zh: '打开抽屉' }) }}</el-button>
        </el-space>

        <el-dialog v-model="dialogVisible" :title="localize({ en: 'Dialog Example', zh: '对话框示例' })" width="480">
          <p>{{ localize({ en: 'This is a dialog content. It should respect the current theme.', zh: '这是对话框内容，应当遵循当前主题。' }) }}</p>
          <el-form label-width="80px" style="margin-top: 16px">
            <el-form-item :label="localize({ en: 'Name', zh: '姓名' })">
              <el-input v-model="formData.name" :placeholder="localize({ en: 'Enter name', zh: '请输入姓名' })" />
            </el-form-item>
            <el-form-item :label="localize({ en: 'Email', zh: '邮箱' })">
              <el-input v-model="formData.email" :placeholder="localize({ en: 'Enter email', zh: '请输入邮箱' })" />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="dialogVisible = false">{{ localize({ en: 'Cancel', zh: '取消' }) }}</el-button>
            <el-button type="primary" @click="dialogVisible = false">{{ localize({ en: 'Confirm', zh: '确认' }) }}</el-button>
          </template>
        </el-dialog>

        <el-drawer v-model="drawerVisible" :title="localize({ en: 'Drawer Example', zh: '抽屉示例' })" size="360">
          <p>{{ localize({ en: 'This is a drawer. Verify it looks correct in dark mode.', zh: '这是一个抽屉。请检查它在深色模式下显示是否正确。' }) }}</p>
          <el-divider />
          <el-descriptions :column="1" border>
            <el-descriptions-item :label="localize({ en: 'Theme', zh: '主题' })">{{ theme }}</el-descriptions-item>
            <el-descriptions-item :label="localize({ en: 'Framework', zh: '框架' })">Vue 3</el-descriptions-item>
            <el-descriptions-item :label="localize({ en: 'UI Library', zh: 'UI 库' })">Element Plus</el-descriptions-item>
          </el-descriptions>
        </el-drawer>

        <h3 style="margin-top: 24px">{{ localize({ en: 'Cards', zh: '卡片' }) }}</h3>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-card shadow="hover">
              <template #header>Card A</template>
              <p>{{ localize({ en: 'Content with hover shadow effect.', zh: '带悬停阴影效果的内容。' }) }}</p>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card shadow="always">
              <template #header>Card B</template>
              <p>{{ localize({ en: 'Content with always shadow.', zh: '始终显示阴影的内容。' }) }}</p>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card shadow="never">
              <template #header>Card C</template>
              <p>{{ localize({ en: 'Content with no shadow.', zh: '无阴影的内容。' }) }}</p>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>

      <!-- Data Display -->
      <el-tab-pane :label="localize({ en: 'Data Display', zh: '数据展示' })" name="data">
        <h3>{{ localize({ en: 'Descriptions', zh: '描述列表' }) }}</h3>
        <el-descriptions :title="localize({ en: 'User Info', zh: '用户信息' })" :column="2" border>
          <el-descriptions-item :label="localize({ en: 'Name', zh: '姓名' })">Tom</el-descriptions-item>
          <el-descriptions-item :label="localize({ en: 'Age', zh: '年龄' })">28</el-descriptions-item>
          <el-descriptions-item :label="localize({ en: 'Phone', zh: '电话' })">+1 234 567 890</el-descriptions-item>
          <el-descriptions-item :label="localize({ en: 'Role', zh: '角色' })">
            <el-tag size="small">Developer</el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="localize({ en: 'Address', zh: '地址' })" :span="2">
            123 Main St, San Francisco, CA 94105
          </el-descriptions-item>
        </el-descriptions>

        <h3 style="margin-top: 24px">{{ localize({ en: 'Collapse', zh: '折叠面板' }) }}</h3>
        <el-collapse>
          <el-collapse-item :title="localize({ en: 'Section 1 — Overview', zh: '第 1 节 —— 概览' })" name="1">
            <p>{{ localize({ en: 'This is the content for section 1. Element Plus components are globally registered.', zh: '这是第 1 节的内容。Element Plus 组件已全局注册。' }) }}</p>
          </el-collapse-item>
          <el-collapse-item :title="localize({ en: 'Section 2 — Dark Mode', zh: '第 2 节 —— 深色模式' })" name="2">
            <p>{{ localize({ en: 'Switch to dark mode using the theme switcher. All Element Plus components will automatically adapt.', zh: '使用主题切换器切换到深色模式。所有 Element Plus 组件都会自动适配。' }) }}</p>
          </el-collapse-item>
          <el-collapse-item :title="localize({ en: 'Section 3 — Extra Themes', zh: '第 3 节 —— 额外主题' })" name="3">
            <p>{{ localize({ en: 'Extra themes based on dark (like Ocean) will also trigger Element Plus dark mode.', zh: '基于深色的额外主题（如 Ocean）也会触发 Element Plus 的深色模式。' }) }}</p>
          </el-collapse-item>
        </el-collapse>

        <h3 style="margin-top: 24px">{{ localize({ en: 'Timeline', zh: '时间线' }) }}</h3>
        <el-timeline>
          <el-timeline-item timestamp="2026-04-12" placement="top" type="primary">
            {{ localize({ en: 'Integrated Element Plus into vue-site', zh: '将 Element Plus 集成进 vue-site' }) }}
          </el-timeline-item>
          <el-timeline-item timestamp="2026-04-12" placement="top" type="success">
            {{ localize({ en: 'Added dark mode support for Element Plus', zh: '为 Element Plus 添加深色模式支持' }) }}
          </el-timeline-item>
          <el-timeline-item timestamp="2026-04-12" placement="top" type="warning">
            {{ localize({ en: 'Created demo page for verification', zh: '创建用于验证的演示页面' }) }}
          </el-timeline-item>
        </el-timeline>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style scoped>
.ep-subtitle {
  color: var(--color-text-secondary);
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

h3 {
  margin-bottom: 12px;
  color: var(--color-text);
}
</style>
