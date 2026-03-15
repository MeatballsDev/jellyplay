<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useEqualizerStore } from '@/stores/equalizer'
import { useSettingsStore } from '@/stores/settings'
import { useRouter } from 'vue-router'
import SectionHeading from '@/components/library/SectionHeading.vue'
import {
  testConnection, getQualityProfiles, getMetadataProfiles, getRootFolders,
} from '@/api/lidarr'

const auth     = useAuthStore()
const eqStore  = useEqualizerStore()
const settings = useSettingsStore()
const router   = useRouter()

// Lidarr form state
const ldrUrl        = ref(settings.lidarrUrl)
const ldrApiKey     = ref(settings.lidarrApiKey)
const ldrRootFolder = ref(settings.lidarrRootFolder)
const ldrQpId       = ref(settings.lidarrQualityProfileId)
const ldrMpId       = ref(settings.lidarrMetaProfileId)

const qualityProfiles = ref([])
const metaProfiles    = ref([])
const rootFolders     = ref([])
const testStatus      = ref(null) // null | 'ok' | 'error'
const testMsg         = ref('')
const loadingProfiles = ref(false)
const saving          = ref(false)

async function testAndLoad() {
  testStatus.value = null
  loadingProfiles.value = true
  settings.saveLidarr({
    url: ldrUrl.value, apiKey: ldrApiKey.value,
    rootFolder: ldrRootFolder.value,
    qualityProfileId: ldrQpId.value,
    metaProfileId: ldrMpId.value,
  })
  try {
    await testConnection()
    const [qp, mp, rf] = await Promise.all([
      getQualityProfiles(), getMetadataProfiles(), getRootFolders(),
    ])
    qualityProfiles.value = qp
    metaProfiles.value    = mp
    rootFolders.value     = rf
    if (!ldrQpId.value && qp.length)       ldrQpId.value = qp[0].id
    if (!ldrMpId.value && mp.length)       ldrMpId.value = mp[0].id
    if (!ldrRootFolder.value && rf.length) ldrRootFolder.value = rf[0].path
    testStatus.value = 'ok'
    testMsg.value    = 'Connected'
  } catch (e) {
    testStatus.value = 'error'
    testMsg.value    = e.response?.data?.message || e.message || 'Connection failed'
  } finally {
    loadingProfiles.value = false
  }
}

function save() {
  settings.saveLidarr({
    url:              ldrUrl.value,
    apiKey:           ldrApiKey.value,
    rootFolder:       ldrRootFolder.value,
    qualityProfileId: ldrQpId.value,
    metaProfileId:    ldrMpId.value,
  })
  saving.value = true
  setTimeout(() => { saving.value = false }, 800)
}

onMounted(() => {
  if (settings.lidarrUrl && settings.lidarrApiKey) testAndLoad()
})

function logout() {
  auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="settings-view">
    <SectionHeading eyebrow="Preferences" title="Settings" />

    <!-- Server Info -->
    <section class="settings-section">
      <h2 class="section-title">Server</h2>
      <div class="info-row">
        <span class="info-label">URL</span>
        <span class="info-value mono">{{ auth.serverUrl }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">User</span>
        <span class="info-value">{{ auth.username }}</span>
      </div>
      <button class="danger-btn" @click="logout">Sign out</button>
    </section>

    <!-- EQ -->
    <section class="settings-section">
      <h2 class="section-title">Equalizer</h2>
      <div class="toggle-row">
        <span>Enabled</span>
        <button
          class="toggle"
          :class="{ on: eqStore.isEnabled }"
          @click="eqStore.isEnabled = !eqStore.isEnabled"
        >
          <span class="toggle-thumb" />
        </button>
      </div>
      <div class="info-row">
        <span class="info-label">Active preset</span>
        <span class="info-value">{{ eqStore.activePreset }}</span>
      </div>
      <button class="ghost-btn" @click="eqStore.reset()">Reset EQ to flat</button>
    </section>

    <!-- Lidarr -->
    <section class="settings-section">
      <h2 class="section-title">Lidarr</h2>
      <p class="section-desc">Configure Lidarr to download albums directly from search results.</p>

      <div class="field">
        <label class="field-label">Server URL</label>
        <input v-model="ldrUrl" class="field-input" type="text" placeholder="http://localhost:8686" />
      </div>

      <div class="field">
        <label class="field-label">API Key</label>
        <input v-model="ldrApiKey" class="field-input" type="password" placeholder="Your Lidarr API key" />
      </div>

      <button
        class="ghost-btn"
        :disabled="!ldrUrl || !ldrApiKey || loadingProfiles"
        @click="testAndLoad"
      >
        {{ loadingProfiles ? 'Connecting…' : 'Test & Load Settings' }}
      </button>

      <div v-if="testStatus" class="test-result" :class="testStatus">
        <svg v-if="testStatus === 'ok'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        {{ testMsg }}
      </div>

      <template v-if="qualityProfiles.length">
        <div class="field">
          <label class="field-label">Quality Profile</label>
          <select v-model="ldrQpId" class="field-select">
            <option v-for="p in qualityProfiles" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
        </div>

        <div class="field">
          <label class="field-label">Metadata Profile</label>
          <select v-model="ldrMpId" class="field-select">
            <option v-for="p in metaProfiles" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
        </div>

        <div class="field">
          <label class="field-label">Root Folder</label>
          <select v-model="ldrRootFolder" class="field-select">
            <option v-for="f in rootFolders" :key="f.path" :value="f.path">{{ f.path }}</option>
          </select>
        </div>

        <button class="accent-btn" @click="save">
          {{ saving ? 'Saved ✓' : 'Save Lidarr Settings' }}
        </button>
      </template>
    </section>

    <!-- About -->
    <section class="settings-section">
      <h2 class="section-title">About</h2>
      <p class="about-text">
        JellyPlay v1.0 — A refined music player for Jellyfin.
      </p>
    </section>
  </div>
</template>

<style scoped>
.settings-view {
  padding: var(--space-2xl);
  max-width: 600px;
}

.settings-section {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  padding: var(--space-xl);
  margin-bottom: var(--space-xl);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.section-title {
  font-family: var(--font-display);
  font-size: var(--text-md);
  font-weight: 600;
  color: var(--color-text-primary);
  padding-bottom: var(--space-md);
  border-bottom: 1px solid var(--color-border);
  margin-bottom: var(--space-xs);
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
}

.info-label {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.info-value {
  font-size: var(--text-sm);
  color: var(--color-text-primary);
}

.info-value.mono {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
}

.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.toggle {
  width: 40px;
  height: 22px;
  background: var(--color-border);
  border-radius: var(--border-radius-full);
  position: relative;
  transition: background var(--duration-base);
}

.toggle.on {
  background: var(--color-accent);
}

.toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 16px;
  height: 16px;
  background: white;
  border-radius: 50%;
  transition: transform var(--duration-base) var(--ease-default);
  box-shadow: var(--shadow-sm);
}

.toggle.on .toggle-thumb {
  transform: translateX(18px);
}

.ghost-btn {
  align-self: flex-start;
  padding: var(--space-xs) var(--space-lg);
  background: transparent;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  font-size: var(--text-sm);
  font-weight: 500;
  transition: color var(--duration-base), border-color var(--duration-base);
}

.ghost-btn:hover {
  color: var(--color-text-primary);
  border-color: var(--color-accent);
}

.danger-btn {
  align-self: flex-start;
  padding: var(--space-xs) var(--space-lg);
  background: transparent;
  color: #e07060;
  border: 1px solid rgba(224, 112, 96, 0.3);
  border-radius: var(--border-radius);
  font-size: var(--text-sm);
  font-weight: 500;
  transition: background var(--duration-base), border-color var(--duration-base);
}

.danger-btn:hover {
  background: rgba(224, 112, 96, 0.08);
  border-color: #e07060;
}

.about-text {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.section-desc {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin-top: calc(-1 * var(--space-xs));
}

.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.field-label {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.field-input,
.field-select {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  color: var(--color-text-primary);
  padding: var(--space-sm) var(--space-md);
  font-size: var(--text-sm);
  font-family: var(--font-body);
  outline: none;
  transition: border-color var(--duration-base);
}

.field-input:focus,
.field-select:focus {
  border-color: var(--color-accent);
}

.field-input::placeholder {
  color: var(--color-text-muted);
}

.test-result {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--text-sm);
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--border-radius);
}

.test-result.ok {
  color: #6dbf8a;
  background: rgba(109, 191, 138, 0.1);
}

.test-result.error {
  color: #e07060;
  background: rgba(224, 112, 96, 0.1);
}

.accent-btn {
  align-self: flex-start;
  padding: var(--space-xs) var(--space-lg);
  background: var(--color-accent);
  color: var(--color-bg);
  border-radius: var(--border-radius);
  font-size: var(--text-sm);
  font-weight: 600;
  font-family: var(--font-body);
  transition: opacity var(--duration-base);
}

.accent-btn:hover {
  opacity: 0.88;
}
</style>
