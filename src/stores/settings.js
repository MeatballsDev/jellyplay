import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const lidarrUrl              = ref(localStorage.getItem('ldr_url')   || '')
  const lidarrApiKey           = ref(localStorage.getItem('ldr_key')   || '')
  const lidarrRootFolder       = ref(localStorage.getItem('ldr_root')  || '')
  const lidarrQualityProfileId = ref(Number(localStorage.getItem('ldr_qp'))  || null)
  const lidarrMetaProfileId    = ref(Number(localStorage.getItem('ldr_mp'))  || null)

  const isConfigured = () =>
    !!(lidarrUrl.value && lidarrApiKey.value && lidarrRootFolder.value &&
       lidarrQualityProfileId.value && lidarrMetaProfileId.value)

  function saveLidarr({ url, apiKey, rootFolder, qualityProfileId, metaProfileId }) {
    lidarrUrl.value              = url
    lidarrApiKey.value           = apiKey
    lidarrRootFolder.value       = rootFolder
    lidarrQualityProfileId.value = qualityProfileId
    lidarrMetaProfileId.value    = metaProfileId
    localStorage.setItem('ldr_url',  url)
    localStorage.setItem('ldr_key',  apiKey)
    localStorage.setItem('ldr_root', rootFolder)
    localStorage.setItem('ldr_qp',   qualityProfileId)
    localStorage.setItem('ldr_mp',   metaProfileId)
  }

  return {
    lidarrUrl, lidarrApiKey, lidarrRootFolder,
    lidarrQualityProfileId, lidarrMetaProfileId,
    isConfigured, saveLidarr,
  }
})
