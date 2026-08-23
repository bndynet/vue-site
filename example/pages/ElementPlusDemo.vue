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
const dateRangeVal = ref<Date[] | null>(null)
const timeVal = ref('')
const inputNumberVal = ref(3)
const colorVal = ref('#409eff')
const radioVal = ref('option1')
const checkboxGroup = ref(['A'])
const buttonRadioVal = ref('Day')
const buttonCheckboxGroup = ref(['Vue'])
const rateVal = ref(3.5)
const activeMenu = ref('overview')
const activeStep = ref(1)
const currentPage = ref(1)
const segmentedVal = ref('Overview')
const calendarDate = ref(new Date())

const treeData = [
  {
    label: 'Documentation',
    children: [
      { label: 'Getting started' },
      { label: 'Theme tokens' },
    ],
  },
  {
    label: 'Components',
    children: [
      { label: 'Forms' },
      { label: 'Data display' },
    ],
  },
]

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
        <div class="ep-button-row">
          <el-button>Default</el-button>
          <el-button type="primary">Primary</el-button>
          <el-button type="success">Success</el-button>
          <el-button type="warning">Warning</el-button>
          <el-button type="danger">Danger</el-button>
          <el-button type="info">Info</el-button>
        </div>

        <div class="ep-button-row ep-button-row--spaced">
          <el-button type="primary" plain>Plain</el-button>
          <el-button type="primary" round>Round</el-button>
          <el-button type="primary" :loading="loading" @click="handleLoadingClick">
            {{ loading ? localize({ en: 'Loading...', zh: '加载中…' }) : localize({ en: 'Click to Load', zh: '点击加载' }) }}
          </el-button>
          <el-button type="primary" disabled>Disabled</el-button>
        </div>

        <h3 style="margin-top: 24px">{{ localize({ en: 'Selected states', zh: '选中状态' }) }}</h3>
        <div class="ep-button-row">
          <el-radio-group v-model="buttonRadioVal">
            <el-radio-button label="Day" value="Day" />
            <el-radio-button label="Week" value="Week" />
            <el-radio-button label="Month" value="Month" />
          </el-radio-group>
          <el-checkbox-group v-model="buttonCheckboxGroup">
            <el-checkbox-button label="Vue" value="Vue" />
            <el-checkbox-button label="TypeScript" value="TypeScript" />
            <el-checkbox-button label="CSS" value="CSS" />
          </el-checkbox-group>
          <el-segmented v-model="segmentedVal" :options="['Overview', 'Activity', 'Settings']" />
        </div>

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
        <div class="ep-badge-row">
          <el-badge :value="12">
            <el-button>Messages</el-button>
          </el-badge>
          <el-badge :value="200" :max="99">
            <el-button>Overflow</el-button>
          </el-badge>
          <el-badge value="new" type="success">
            <el-button>New</el-button>
          </el-badge>
          <el-badge :value="8" type="primary">
            <el-button>Primary</el-button>
          </el-badge>
          <el-badge is-dot>
            <el-button>Dot</el-button>
          </el-badge>
        </div>

        <div class="ep-progress-stack">
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

          <el-form-item :label="localize({ en: 'Date Range', zh: '日期范围' })">
            <el-date-picker
              v-model="dateRangeVal"
              type="daterange"
              range-separator="To"
              start-placeholder="Start date"
              end-placeholder="End date"
              style="width: 100%"
            />
          </el-form-item>

          <el-form-item :label="localize({ en: 'Time Picker', zh: '时间选择' })">
            <el-time-picker v-model="timeVal" :placeholder="localize({ en: 'Pick a time', zh: '选择时间' })" style="width: 100%" />
          </el-form-item>

          <el-form-item :label="localize({ en: 'Number', zh: '数字输入' })">
            <el-input-number v-model="inputNumberVal" :min="0" :max="10" />
          </el-form-item>

          <el-form-item :label="localize({ en: 'Color Picker', zh: '颜色选择器' })">
            <el-color-picker v-model="colorVal" show-alpha />
          </el-form-item>

          <el-form-item :label="localize({ en: 'Textarea', zh: '多行文本' })">
            <el-input
              v-model="formData.description"
              type="textarea"
              :rows="3"
              :placeholder="localize({ en: 'Write a short note...', zh: '写一段简短说明…' })"
            />
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

          <el-form-item :label="localize({ en: 'Upload', zh: '文件上传' })">
            <el-upload drag action="#" :auto-upload="false" :limit="3">
              <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
              <div class="el-upload__text">
                {{ localize({ en: 'Drop a file here or', zh: '拖放文件到这里，或' }) }}
                <em>{{ localize({ en: 'browse', zh: '点击选择' }) }}</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">{{ localize({ en: 'Files stay local in this demo.', zh: '此演示不会上传文件。' }) }}</div>
              </template>
            </el-upload>
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

      <!-- Navigation & Layout -->
      <el-tab-pane :label="localize({ en: 'Navigation & Layout', zh: '导航与布局' })" name="navigation">
        <h3>{{ localize({ en: 'Breadcrumb & Pagination', zh: '面包屑与分页' }) }}</h3>
        <div class="ep-component-row">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item>{{ localize({ en: 'Home', zh: '首页' }) }}</el-breadcrumb-item>
            <el-breadcrumb-item>{{ localize({ en: 'Components', zh: '组件' }) }}</el-breadcrumb-item>
            <el-breadcrumb-item>{{ localize({ en: 'Navigation', zh: '导航' }) }}</el-breadcrumb-item>
          </el-breadcrumb>
          <el-pagination
            v-model:current-page="currentPage"
            background
            layout="prev, pager, next, total"
            :total="80"
            :page-size="10"
          />
        </div>

        <h3 style="margin-top: 24px">{{ localize({ en: 'Menu', zh: '菜单' }) }}</h3>
        <el-menu :default-active="activeMenu" class="ep-demo-menu" mode="horizontal">
          <el-menu-item index="overview">{{ localize({ en: 'Overview', zh: '概览' }) }}</el-menu-item>
          <el-menu-item index="activity">{{ localize({ en: 'Activity', zh: '动态' }) }}</el-menu-item>
          <el-menu-item index="settings">{{ localize({ en: 'Settings', zh: '设置' }) }}</el-menu-item>
        </el-menu>

        <h3 style="margin-top: 24px">{{ localize({ en: 'Steps', zh: '步骤条' }) }}</h3>
        <el-steps :active="activeStep" finish-status="success" align-center>
          <el-step :title="localize({ en: 'Account', zh: '账户' })" :description="localize({ en: 'Create account', zh: '创建账户' })" />
          <el-step :title="localize({ en: 'Profile', zh: '资料' })" :description="localize({ en: 'Complete profile', zh: '完善资料' })" />
          <el-step :title="localize({ en: 'Done', zh: '完成' })" :description="localize({ en: 'Ready to use', zh: '开始使用' })" />
        </el-steps>
        <el-button class="ep-step-button" @click="activeStep = (activeStep + 1) % 3">
          {{ localize({ en: 'Advance step', zh: '下一步' }) }}
        </el-button>
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
        <div class="ep-button-row">
          <el-button type="primary" @click="handleClick">{{ localize({ en: 'Message', zh: '消息' }) }}</el-button>
          <el-button type="warning" @click="handleConfirm">{{ localize({ en: 'Confirm Box', zh: '确认框' }) }}</el-button>
          <el-button type="success" @click="showNotification">{{ localize({ en: 'Notification', zh: '通知' }) }}</el-button>
          <el-button type="info" @click="dialogVisible = true">{{ localize({ en: 'Open Dialog', zh: '打开对话框' }) }}</el-button>
          <el-button @click="drawerVisible = true">{{ localize({ en: 'Open Drawer', zh: '打开抽屉' }) }}</el-button>
        </div>

        <h3 style="margin-top: 24px">{{ localize({ en: 'Tooltips & Popovers', zh: '文字提示与弹出框' }) }}</h3>
        <div class="ep-button-row">
          <el-tooltip :content="localize({ en: 'Tooltip follows the active theme', zh: '文字提示会跟随当前主题' })" placement="top">
            <el-button>{{ localize({ en: 'Hover for tooltip', zh: '悬停查看提示' }) }}</el-button>
          </el-tooltip>
          <el-popover :title="localize({ en: 'Popover', zh: '弹出框' })" :width="240" trigger="click">
            <p>{{ localize({ en: 'Popover content with themed text and surface.', zh: '弹出框内容会适配主题文字和背景。' }) }}</p>
            <template #reference>
              <el-button type="primary" plain>{{ localize({ en: 'Click for popover', zh: '点击查看弹出框' }) }}</el-button>
            </template>
          </el-popover>
          <el-dropdown>
            <el-button>{{ localize({ en: 'Dropdown', zh: '下拉菜单' }) }}<el-icon class="el-icon--right"><ArrowDown /></el-icon></el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>{{ localize({ en: 'Action one', zh: '操作一' }) }}</el-dropdown-item>
                <el-dropdown-item>{{ localize({ en: 'Action two', zh: '操作二' }) }}</el-dropdown-item>
                <el-dropdown-item disabled>{{ localize({ en: 'Disabled action', zh: '禁用操作' }) }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-popconfirm :title="localize({ en: 'Delete this item?', zh: '确定删除此项吗？' })">
            <template #reference>
              <el-button type="danger" plain>{{ localize({ en: 'Popconfirm', zh: '气泡确认' }) }}</el-button>
            </template>
          </el-popconfirm>
        </div>

        <h3 style="margin-top: 24px">{{ localize({ en: 'Result States', zh: '结果状态' }) }}</h3>
        <el-result
          icon="success"
          :title="localize({ en: 'Success', zh: '成功' })"
          :sub-title="localize({ en: 'Your changes have been saved.', zh: '更改已保存。' })"
        >
          <template #extra>
            <el-button type="primary">{{ localize({ en: 'Continue', zh: '继续' }) }}</el-button>
            <el-button>{{ localize({ en: 'Back', zh: '返回' }) }}</el-button>
          </template>
        </el-result>

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
        <h3>{{ localize({ en: 'Avatar & Statistics', zh: '头像与统计数值' }) }}</h3>
        <div class="ep-component-row ep-stat-row">
          <el-avatar :size="48">JD</el-avatar>
          <el-avatar :size="48" shape="square">EP</el-avatar>
          <el-badge is-dot type="success"><el-avatar :size="48">{{ localize({ en: 'Online', zh: '在线' }) }}</el-avatar></el-badge>
          <el-statistic :title="localize({ en: 'Active users', zh: '活跃用户' })" :value="2688" />
          <el-statistic :title="localize({ en: 'Growth', zh: '增长率' })" :value="12.6" suffix="%" />
        </div>

        <h3 style="margin-top: 24px">{{ localize({ en: 'Tree', zh: '树形控件' }) }}</h3>
        <el-tree :data="treeData" node-key="label" default-expand-all highlight-current class="ep-demo-tree" />

        <h3 style="margin-top: 24px">{{ localize({ en: 'Calendar', zh: '日历' }) }}</h3>
        <el-calendar v-model="calendarDate" class="ep-demo-calendar" />

        <h3 style="margin-top: 24px">{{ localize({ en: 'Empty & Skeleton', zh: '空状态与骨架屏' }) }}</h3>
        <el-row :gutter="16">
          <el-col :xs="24" :md="12">
            <el-empty :description="localize({ en: 'No data yet', zh: '暂无数据' })" />
          </el-col>
          <el-col :xs="24" :md="12">
            <el-skeleton :rows="4" animated />
          </el-col>
        </el-row>

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
.ep-demo {
  padding: 40px 48px;
}

.ep-button-row,
.ep-badge-row,
.ep-component-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  width: 100%;
}

.ep-button-row--spaced {
  margin-top: 12px;
}

.ep-badge-row {
  gap: 18px 30px;
}

.ep-component-row {
  justify-content: space-between;
}

.ep-demo-menu {
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-content-bg);
}

.ep-step-button {
  margin-top: 16px;
}

.ep-demo-tree {
  max-width: 420px;
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: var(--color-content-bg);
}

.ep-demo-calendar {
  --el-calendar-selected-bg-color: var(--color-table-row-hover);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
}

.ep-stat-row :deep(.el-statistic) {
  min-width: 120px;
}

.ep-demo :deep(.el-result) {
  padding: 24px 0;
}

.ep-button-row :deep(.el-button),
.ep-badge-row :deep(.el-button) {
  margin-left: 0;
}

.ep-progress-stack {
  width: 100%;
  max-width: 400px;
  margin-top: 20px;
}

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

@media (max-width: 640px) {
  .ep-demo {
    padding: 0;
  }

  .ep-demo :deep(.el-form-item) {
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .ep-demo :deep(.el-form-item__label) {
    justify-content: flex-start;
    width: 100% !important;
    height: auto;
    margin: 0;
  }

  .ep-demo :deep(.el-form-item__content) {
    margin-left: 0 !important;
  }
}
</style>
