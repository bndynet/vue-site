<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useTheme, ElMessage, ElMessageBox, ElNotification } from '@bndynet/vue-site'

const { theme } = useTheme()

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
  ElMessage.success('Button clicked!')
}

function handleConfirm() {
  ElMessageBox.confirm('This is a confirm dialog. Continue?', 'Confirm', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    type: 'warning',
  })
    .then(() => ElMessage.success('Confirmed!'))
    .catch(() => ElMessage.info('Cancelled'))
}

function showNotification() {
  ElNotification({
    title: 'Notification',
    message: 'This is a notification message.',
    type: 'success',
  })
}

function handleLoadingClick() {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('Loading completed!')
  }, 2000)
}
</script>

<template>
  <div class="ep-demo">
    <h1>Element Plus Components</h1>
    <p class="ep-subtitle">
      Verify that Element Plus works correctly with the current theme:
      <el-tag :type="theme === 'light' || theme === 'sepia' ? '' : 'info'" effect="dark">
        {{ theme }}
      </el-tag>
    </p>

    <el-tabs v-model="activeName" type="border-card">
      <!-- Buttons & Tags -->
      <el-tab-pane label="Buttons & Tags" name="buttons">
        <h3>Buttons</h3>
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
            {{ loading ? 'Loading...' : 'Click to Load' }}
          </el-button>
          <el-button type="primary" disabled>Disabled</el-button>
        </el-space>

        <h3 style="margin-top: 24px">Tags</h3>
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

        <h3 style="margin-top: 24px">Badges & Progress</h3>
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
      <el-tab-pane label="Form Controls" name="forms">
        <el-form label-width="120px" style="max-width: 500px">
          <el-form-item label="Input">
            <el-input v-model="inputVal" placeholder="Type something..." clearable />
          </el-form-item>

          <el-form-item label="Select">
            <el-select v-model="selectVal" placeholder="Choose one" clearable>
              <el-option label="Option A" value="a" />
              <el-option label="Option B" value="b" />
              <el-option label="Option C" value="c" />
              <el-option label="Option D (disabled)" value="d" disabled />
            </el-select>
          </el-form-item>

          <el-form-item label="Date Picker">
            <el-date-picker v-model="dateVal" type="date" placeholder="Pick a date" style="width: 100%" />
          </el-form-item>

          <el-form-item label="Radio">
            <el-radio-group v-model="radioVal">
              <el-radio value="option1">Option 1</el-radio>
              <el-radio value="option2">Option 2</el-radio>
              <el-radio value="option3" disabled>Disabled</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="Checkbox">
            <el-checkbox-group v-model="checkboxGroup">
              <el-checkbox label="A" value="A" />
              <el-checkbox label="B" value="B" />
              <el-checkbox label="C" value="C" />
            </el-checkbox-group>
          </el-form-item>

          <el-form-item label="Switch">
            <el-switch v-model="switchVal" active-text="ON" inactive-text="OFF" />
          </el-form-item>

          <el-form-item label="Slider">
            <el-slider v-model="sliderVal" show-input />
          </el-form-item>

          <el-form-item label="Rate">
            <el-rate v-model="rateVal" allow-half show-score />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- Table -->
      <el-tab-pane label="Table" name="table">
        <el-table :data="tableData" stripe border style="width: 100%">
          <el-table-column prop="name" label="Name" sortable />
          <el-table-column prop="age" label="Age" sortable width="100" />
          <el-table-column prop="role" label="Role">
            <template #default="{ row }">
              <el-tag size="small">{{ row.role }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="Status" width="120">
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
          <el-table-column label="Actions" width="150">
            <template #default>
              <el-button size="small" type="primary" link>Edit</el-button>
              <el-button size="small" type="danger" link>Delete</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- Feedback -->
      <el-tab-pane label="Feedback" name="feedback">
        <h3>Alerts</h3>
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

        <h3 style="margin-top: 24px">Messages & Dialogs</h3>
        <el-space wrap>
          <el-button type="primary" @click="handleClick">Message</el-button>
          <el-button type="warning" @click="handleConfirm">Confirm Box</el-button>
          <el-button type="success" @click="showNotification">Notification</el-button>
          <el-button type="info" @click="dialogVisible = true">Open Dialog</el-button>
          <el-button @click="drawerVisible = true">Open Drawer</el-button>
        </el-space>

        <el-dialog v-model="dialogVisible" title="Dialog Example" width="480">
          <p>This is a dialog content. It should respect the current theme.</p>
          <el-form label-width="80px" style="margin-top: 16px">
            <el-form-item label="Name">
              <el-input v-model="formData.name" placeholder="Enter name" />
            </el-form-item>
            <el-form-item label="Email">
              <el-input v-model="formData.email" placeholder="Enter email" />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="dialogVisible = false">Cancel</el-button>
            <el-button type="primary" @click="dialogVisible = false">Confirm</el-button>
          </template>
        </el-dialog>

        <el-drawer v-model="drawerVisible" title="Drawer Example" size="360">
          <p>This is a drawer. Verify it looks correct in dark mode.</p>
          <el-divider />
          <el-descriptions :column="1" border>
            <el-descriptions-item label="Theme">{{ theme }}</el-descriptions-item>
            <el-descriptions-item label="Framework">Vue 3</el-descriptions-item>
            <el-descriptions-item label="UI Library">Element Plus</el-descriptions-item>
          </el-descriptions>
        </el-drawer>

        <h3 style="margin-top: 24px">Cards</h3>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-card shadow="hover">
              <template #header>Card A</template>
              <p>Content with hover shadow effect.</p>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card shadow="always">
              <template #header>Card B</template>
              <p>Content with always shadow.</p>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card shadow="never">
              <template #header>Card C</template>
              <p>Content with no shadow.</p>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>

      <!-- Data Display -->
      <el-tab-pane label="Data Display" name="data">
        <h3>Descriptions</h3>
        <el-descriptions title="User Info" :column="2" border>
          <el-descriptions-item label="Name">Tom</el-descriptions-item>
          <el-descriptions-item label="Age">28</el-descriptions-item>
          <el-descriptions-item label="Phone">+1 234 567 890</el-descriptions-item>
          <el-descriptions-item label="Role">
            <el-tag size="small">Developer</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="Address" :span="2">
            123 Main St, San Francisco, CA 94105
          </el-descriptions-item>
        </el-descriptions>

        <h3 style="margin-top: 24px">Collapse</h3>
        <el-collapse>
          <el-collapse-item title="Section 1 — Overview" name="1">
            <p>This is the content for section 1. Element Plus components are globally registered.</p>
          </el-collapse-item>
          <el-collapse-item title="Section 2 — Dark Mode" name="2">
            <p>Switch to dark mode using the theme switcher. All Element Plus components will automatically adapt.</p>
          </el-collapse-item>
          <el-collapse-item title="Section 3 — Extra Themes" name="3">
            <p>Extra themes based on dark (like Ocean) will also trigger Element Plus dark mode.</p>
          </el-collapse-item>
        </el-collapse>

        <h3 style="margin-top: 24px">Timeline</h3>
        <el-timeline>
          <el-timeline-item timestamp="2026-04-12" placement="top" type="primary">
            Integrated Element Plus into vue-site
          </el-timeline-item>
          <el-timeline-item timestamp="2026-04-12" placement="top" type="success">
            Added dark mode support for Element Plus
          </el-timeline-item>
          <el-timeline-item timestamp="2026-04-12" placement="top" type="warning">
            Created demo page for verification
          </el-timeline-item>
        </el-timeline>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style scoped>
.ep-demo {
  max-width: 860px;
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
</style>
